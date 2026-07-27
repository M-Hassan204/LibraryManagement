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
                    if (type == "ISBN_10") metadata.ISBN10 = valProp.GetString();
                    if (type == "ISBN_13") metadata.ISBN13 = valProp.GetString();
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
}
