using System.Text.Json;
using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Services;

public class BookMetadataService : IBookMetadataService
{
    private readonly HttpClient _httpClient;
    private readonly IImageService _imageService;

    public BookMetadataService(HttpClient httpClient, IImageService imageService)
    {
        _httpClient = httpClient;
        _imageService = imageService;
    }

    public async Task<ApiResponse<BookMetadataDto>> FetchMetadataAsync(FetchBookMetadataRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ISBN) && (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Author)))
        {
            throw new ValidationException(new List<string> { "Either ISBN or both Title and Author must be provided." });
        }

        string query = "";
        if (!string.IsNullOrWhiteSpace(request.ISBN))
        {
            query = $"isbn:{request.ISBN}";
        }
        else
        {
            query = $"intitle:{Uri.EscapeDataString(request.Title ?? "")} inauthor:{Uri.EscapeDataString(request.Author ?? "")}";
        }

        var url = $"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=1";
        var response = await _httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
        {
            return ApiResponse<BookMetadataDto>.FailureResponse("Failed to connect to Google Books API.");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        
        if (!doc.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
        {
            return ApiResponse<BookMetadataDto>.FailureResponse("No metadata found for this book.");
        }

        var item = items[0];
        if (!item.TryGetProperty("volumeInfo", out var volumeInfo))
        {
            return ApiResponse<BookMetadataDto>.FailureResponse("No metadata found for this book.");
        }

        var metadata = new BookMetadataDto();

        if (volumeInfo.TryGetProperty("title", out var titleProp))
            metadata.Title = titleProp.GetString() ?? "";

        if (volumeInfo.TryGetProperty("description", out var descProp))
            metadata.Description = descProp.GetString();

        if (volumeInfo.TryGetProperty("publisher", out var pubProp))
            metadata.Publisher = pubProp.GetString();

        if (volumeInfo.TryGetProperty("publishedDate", out var pubDateProp))
        {
            var pubDateStr = pubDateProp.GetString();
            if (!string.IsNullOrWhiteSpace(pubDateStr) && pubDateStr.Length >= 4)
            {
                if (int.TryParse(pubDateStr.Substring(0, 4), out int year))
                    metadata.PublishedYear = year;
            }
        }

        if (volumeInfo.TryGetProperty("pageCount", out var pageProp) && pageProp.ValueKind == JsonValueKind.Number)
            metadata.Pages = pageProp.GetInt32();

        if (volumeInfo.TryGetProperty("language", out var langProp))
            metadata.Language = langProp.GetString();

        if (volumeInfo.TryGetProperty("industryIdentifiers", out var identifiers) && identifiers.ValueKind == JsonValueKind.Array)
        {
            foreach (var id in identifiers.EnumerateArray())
            {
                if (id.TryGetProperty("type", out var typeProp) && id.TryGetProperty("identifier", out var valProp))
                {
                    var type = typeProp.GetString();
                    if (type == "ISBN_10") metadata.Isbn10 = valProp.GetString();
                    if (type == "ISBN_13") metadata.Isbn13 = valProp.GetString();
                }
            }
        }

        if (volumeInfo.TryGetProperty("categories", out var cats) && cats.ValueKind == JsonValueKind.Array)
        {
            foreach (var cat in cats.EnumerateArray())
            {
                if (cat.GetString() is string catStr) metadata.Categories.Add(catStr);
            }
        }

        if (volumeInfo.TryGetProperty("authors", out var authors) && authors.ValueKind == JsonValueKind.Array)
        {
            foreach (var a in authors.EnumerateArray())
            {
                if (a.GetString() is string authorStr) metadata.Authors.Add(authorStr);
            }
        }

        if (volumeInfo.TryGetProperty("imageLinks", out var imageLinks))
        {
            string? coverUrl = null;
            if (imageLinks.TryGetProperty("thumbnail", out var thumbProp))
                coverUrl = thumbProp.GetString();
            else if (imageLinks.TryGetProperty("smallThumbnail", out var smallThumbProp))
                coverUrl = smallThumbProp.GetString();

            if (!string.IsNullOrWhiteSpace(coverUrl))
            {
                try
                {
                    var imageResponse = await _httpClient.GetAsync(coverUrl);
                    if (imageResponse.IsSuccessStatusCode)
                    {
                        using var imageStream = await imageResponse.Content.ReadAsStreamAsync();
                        var ext = "jpg"; // Google books thumbnails are typically jpg
                        var localUrl = await _imageService.UploadImageAsync(imageStream, $"cover.{ext}", "books");
                        metadata.CoverImageUrl = localUrl;
                    }
                }
                catch (Exception ex)
                {
                    // If image download fails, just ignore and proceed without cover
                    Console.WriteLine($"Failed to download cover image: {ex.Message}");
                }
            }
        }

        return ApiResponse<BookMetadataDto>.SuccessResponse(metadata, "Metadata fetched successfully.");
    }

    public async Task<ApiResponse<List<BookMetadataDto>>> SearchBooksAsync(string query, int maxResults = 10)
    {
        var url = $"https://openlibrary.org/search.json?q={Uri.EscapeDataString(query)}&limit={maxResults}";
        
        try
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return ApiResponse<List<BookMetadataDto>>.FailureResponse("Failed to fetch data from Open Library API.");
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            
            if (!doc.RootElement.TryGetProperty("docs", out var items) || items.GetArrayLength() == 0)
            {
                return ApiResponse<List<BookMetadataDto>>.FailureResponse("No books found for this search query.");
            }

            var results = new List<BookMetadataDto>();

            foreach (var item in items.EnumerateArray())
            {
                try
                {
                    var book = MapOpenLibraryDocToDto(item);
                    results.Add(book);
                }
                catch
                {
                    // Ignore mapping errors for individual books
                }
            }

            return ApiResponse<List<BookMetadataDto>>.SuccessResponse(results, $"Found {results.Count} results.");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BookMetadataDto>>.FailureResponse($"Failed to connect to API: {ex.Message}");
        }
    }

    private BookMetadataDto MapOpenLibraryDocToDto(JsonElement doc)
    {
        var book = new BookMetadataDto();

        if (doc.TryGetProperty("title", out var titleProp))
            book.Title = titleProp.GetString() ?? "";

        if (doc.TryGetProperty("subtitle", out var subtitleProp))
            book.Subtitle = subtitleProp.GetString();

        if (doc.TryGetProperty("first_publish_year", out var yearProp) && yearProp.ValueKind == JsonValueKind.Number)
            book.PublishedYear = yearProp.GetInt32();

        if (doc.TryGetProperty("number_of_pages_median", out var pagesProp) && pagesProp.ValueKind == JsonValueKind.Number)
            book.Pages = pagesProp.GetInt32();

        if (doc.TryGetProperty("author_name", out var authorsProp) && authorsProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var author in authorsProp.EnumerateArray())
            {
                if (author.GetString() is string a) book.Authors.Add(a);
            }
        }

        if (doc.TryGetProperty("publisher", out var publishersProp) && publishersProp.ValueKind == JsonValueKind.Array)
        {
            var publisher = publishersProp.EnumerateArray().FirstOrDefault();
            if (publisher.ValueKind != JsonValueKind.Undefined) book.Publisher = publisher.GetString();
        }

        if (doc.TryGetProperty("language", out var languagesProp) && languagesProp.ValueKind == JsonValueKind.Array)
        {
            var lang = languagesProp.EnumerateArray().FirstOrDefault();
            if (lang.ValueKind != JsonValueKind.Undefined) book.Language = lang.GetString();
        }

        if (doc.TryGetProperty("subject", out var subjectsProp) && subjectsProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var sub in subjectsProp.EnumerateArray())
            {
                if (sub.GetString() is string s) book.Categories.Add(s);
            }
        }

        if (doc.TryGetProperty("isbn", out var isbnsProp) && isbnsProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var isbnToken in isbnsProp.EnumerateArray())
            {
                var isbn = isbnToken.GetString();
                if (string.IsNullOrWhiteSpace(isbn)) continue;

                isbn = isbn.Replace("-", "").Trim();
                if (isbn.Length == 13 && string.IsNullOrEmpty(book.Isbn13)) book.Isbn13 = isbn;
                if (isbn.Length == 10 && string.IsNullOrEmpty(book.Isbn10)) book.Isbn10 = isbn;
            }
        }

        if (doc.TryGetProperty("cover_i", out var coverProp) && coverProp.ValueKind == JsonValueKind.Number)
        {
            book.CoverImageUrl = $"https://covers.openlibrary.org/b/id/{coverProp.GetInt32()}-L.jpg";
        }

        return book;
    }
}
