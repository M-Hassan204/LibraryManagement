import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:5132/api';
const EMAIL = 'admin@libraryms.com';
const PASSWORD = 'Admin@123456!';

async function login() {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (!res.ok) throw new Error('Failed to login: ' + await res.text());
    const data = await res.json();
    return data.data.token;
}

async function getAllBooks() {
    const res = await fetch(`${API_BASE_URL}/book?pageSize=1000`);
    if (!res.ok) throw new Error('Failed to fetch books: ' + await res.text());
    const data = await res.json();
    return data.data.items;
}

function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    const words1 = s1.split(/\s+/);
    const words2 = new Set(s2.split(/\s+/));
    let match = 0;
    for (const w of words1) if (words2.has(w)) match++;
    return match / Math.max(words1.length, words2.size);
}

function normalizeTitle(title) {
    if (!title) return '';
    let t = title;
    // Remove subtitle after ':'
    const colonIdx = t.indexOf(':');
    if (colonIdx !== -1) t = t.substring(0, colonIdx);
    
    // Remove volume info (e.g. Vol. 1, Volume 1, Vol 2)
    t = t.replace(/(?:vol\.|volume|vol)\s*\d+/ig, '');
    
    // Remove edition text
    t = t.replace(/\b\d+(st|nd|rd|th)\s+ed(?:ition)?\b/ig, '');
    t = t.replace(/\bedition\b/ig, '');
    
    // Remove punctuation
    t = t.replace(/[^\w\s]/g, ' ');
    
    // Remove extra whitespace
    t = t.replace(/\s+/g, ' ').trim();
    
    return t;
}

async function searchGoogleBooks(queryParam, title, author) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${queryParam}&maxResults=5`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    
    let bestMatch = null;
    let bestScore = -1;
    
    for (const item of data.items) {
        const info = item.volumeInfo;
        if (!info.imageLinks || (!info.imageLinks.thumbnail && !info.imageLinks.smallThumbnail)) continue;
        
        let score = calculateSimilarity(title, info.title);
        if (author && info.authors && info.authors.length > 0) {
            score += calculateSimilarity(author, info.authors[0]) * 0.5;
        }
        
        if (score > bestScore) {
            bestScore = score;
            let imgUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;
            imgUrl = imgUrl.replace('http:', 'https:').replace('&edge=curl', '').replace('zoom=1', 'zoom=0');
            bestMatch = imgUrl;
        }
    }
    
    return bestMatch;
}

async function searchOpenLibrary(queryParams, title, author) {
    const url = `https://openlibrary.org/search.json?${queryParams}&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.docs || data.docs.length === 0) return null;
    
    let bestMatch = null;
    let bestScore = -1;
    
    for (const doc of data.docs) {
        if (!doc.cover_i) continue;
        
        let score = calculateSimilarity(title, doc.title);
        if (author && doc.author_name && doc.author_name.length > 0) {
            score += calculateSimilarity(author, doc.author_name[0]) * 0.5;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
    }
    
    return bestMatch;
}

async function uploadCover(bookId, imageUrl, token) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to download image from ${imageUrl}`);
    
    const buffer = await imgRes.arrayBuffer();
    const blob = new Blob([buffer], { type: imgRes.headers.get('content-type') || 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('file', blob, 'cover.jpg');
    
    const res = await fetch(`${API_BASE_URL}/book/${bookId}/cover-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
    }
}

async function main() {
    console.log('Logging in...');
    const token = await login();
    console.log('Logged in successfully.');
    
    console.log('Fetching books...');
    const books = await getAllBooks();
    console.log(`Found ${books.length} books.`);
    
    const results = [];
    
    for (const book of books) {
        if (book.coverImageUrl) {
            console.log(`[SKIP] Book "${book.title}" already has a cover.`);
            continue;
        }
        
        console.log(`\n======================================================`);
        console.log(`[PROCESS] Searching cover for "${book.title}"`);
        
        const authorName = book.authorName || (book.author ? `${book.author.firstName} ${book.author.lastName}` : '');
        const normTitle = normalizeTitle(book.title);
        console.log(`Normalized title: "${normTitle}"`);
        
        const strategies = [];
        const cleanIsbn = (book.isbn || '').replace(/[^0-9X]/gi, '');
        if (cleanIsbn.length === 13) {
            strategies.push({ name: 'ISBN-13', gb: `isbn:${cleanIsbn}`, ol: `isbn=${cleanIsbn}` });
        } else if (cleanIsbn.length === 10) {
            strategies.push({ name: 'ISBN-10', gb: `isbn:${cleanIsbn}`, ol: `isbn=${cleanIsbn}` });
        } else if (cleanIsbn) {
            strategies.push({ name: 'ISBN', gb: `isbn:${cleanIsbn}`, ol: `isbn=${cleanIsbn}` });
        }
        
        if (authorName) {
            strategies.push({ 
                name: 'Exact Title + Author', 
                gb: `intitle:"${encodeURIComponent(normTitle)}"+inauthor:"${encodeURIComponent(authorName)}"`, 
                ol: `title=${encodeURIComponent(normTitle)}&author=${encodeURIComponent(authorName)}` 
            });
        }
        
        strategies.push({ 
            name: 'Exact Title', 
            gb: `intitle:"${encodeURIComponent(normTitle)}"`, 
            ol: `title=${encodeURIComponent(normTitle)}` 
        });
        
        strategies.push({ 
            name: 'Fuzzy title match', 
            gb: encodeURIComponent(normTitle), 
            ol: `q=${encodeURIComponent(normTitle)}` 
        });
        
        let foundCover = null;
        let finalProvider = '';
        let finalMatchUrl = '';
        const queriesAttempted = [];
        
        for (const strategy of strategies) {
            queriesAttempted.push(strategy.name);
            console.log(` -> Trying strategy: ${strategy.name}`);
            
            // Try Google Books
            try {
                const gbResult = await searchGoogleBooks(strategy.gb, normTitle, authorName);
                if (gbResult) {
                    foundCover = gbResult;
                    finalProvider = 'Google Books';
                    finalMatchUrl = gbResult;
                    break;
                }
            } catch (e) {
                console.error(`    GB Error: ${e.message}`);
            }
            
            // Try Open Library
            try {
                const olResult = await searchOpenLibrary(strategy.ol, normTitle, authorName);
                if (olResult) {
                    foundCover = olResult;
                    finalProvider = 'Open Library';
                    finalMatchUrl = olResult;
                    break;
                }
            } catch (e) {
                console.error(`    OL Error: ${e.message}`);
            }
        }
        
        const resultRecord = {
            originalTitle: book.title,
            queriesAttempted: queriesAttempted,
            providerUsed: finalProvider || 'None',
            matchSelected: finalMatchUrl || 'None',
            reason: ''
        };
        
        if (foundCover) {
            console.log(`   [SUCCESS] Found cover via ${finalProvider}: ${finalMatchUrl}`);
            try {
                await uploadCover(book.id, foundCover, token);
                console.log(`   -> Successfully uploaded to backend!`);
            } catch (err) {
                console.error(`   -> Error uploading: ${err.message}`);
                resultRecord.reason = `Found but failed to upload: ${err.message}`;
            }
        } else {
            console.log(`   [FAILED] No cover found across all strategies and providers.`);
            resultRecord.reason = 'No match found on GB or OL after exhausting all strategies.';
        }
        
        results.push(resultRecord);
        
        // Wait a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\n\n=== FINAL SUMMARY REPORT ===`);
    for (const r of results) {
        console.log(`\nTitle: ${r.originalTitle}`);
        console.log(`Queries Attempted: ${r.queriesAttempted.join(', ')}`);
        console.log(`Provider: ${r.providerUsed}`);
        console.log(`Selected Match: ${r.matchSelected}`);
        if (r.reason) console.log(`Reason: ${r.reason}`);
    }
}

main().catch(console.error);
