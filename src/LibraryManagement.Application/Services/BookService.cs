using AutoMapper;
using Microsoft.EntityFrameworkCore;
using LibraryManagement.Application.DTOs.Book;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Services;

public class BookService : IBookService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;

    public BookService(IUnitOfWork unitOfWork, IMapper mapper, IImageService imageService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _imageService = imageService;
    }

    public async Task<ApiResponse<PagedResult<BookDto>>> GetAllBooksAsync(ResourceParameters parameters)
    {
        var query = _unitOfWork.Books.Query()
            .Include(b => b.Category)
            .Include(b => b.Author)
            .AsQueryable();

        // Filtering / Searching
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var search = parameters.SearchTerm.ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(search) 
                                  || b.Author.FirstName.ToLower().Contains(search)
                                  || b.Author.LastName.ToLower().Contains(search)
                                  || b.Category.Name.ToLower().Contains(search));
        }

        // Sorting
        if (!string.IsNullOrWhiteSpace(parameters.SortBy))
        {
            if (parameters.SortBy.Equals("title", StringComparison.OrdinalIgnoreCase))
                query = parameters.SortDescending ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title);
            else if (parameters.SortBy.Equals("author", StringComparison.OrdinalIgnoreCase))
                query = parameters.SortDescending ? query.OrderByDescending(b => b.Author.FirstName).ThenByDescending(b => b.Author.LastName) : query.OrderBy(b => b.Author.FirstName).ThenBy(b => b.Author.LastName);
            else if (parameters.SortBy.Equals("category", StringComparison.OrdinalIgnoreCase))
                query = parameters.SortDescending ? query.OrderByDescending(b => b.Category.Name) : query.OrderBy(b => b.Category.Name);
        }
        else
        {
            query = query.OrderBy(b => b.Title);
        }

        var totalCount = await query.CountAsync();

        var books = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var bookDtos = _mapper.Map<IEnumerable<BookDto>>(books);
        
        var pagedResult = PagedResult<BookDto>.Create(bookDtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return ApiResponse<PagedResult<BookDto>>.SuccessResponse(pagedResult);
    }

    public async Task<ApiResponse<BookDto>> GetBookByIdAsync(int id)
    {
        var book = await _unitOfWork.Books.Query()
            .Include(b => b.Category)
            .Include(b => b.Author)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (book == null)
            throw new NotFoundException($"Book with ID {id} not found.");

        var bookDto = _mapper.Map<BookDto>(book);
        return ApiResponse<BookDto>.SuccessResponse(bookDto);
    }

    public async Task<ApiResponse<BookDto>> CreateBookAsync(CreateBookRequestDto request)
    {
        // Verify Category and Author exist
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null) throw new NotFoundException($"Category with ID {request.CategoryId} not found.");

        var author = await _unitOfWork.Authors.GetByIdAsync(request.AuthorId);
        if (author == null) throw new NotFoundException($"Author with ID {request.AuthorId} not found.");

        var book = _mapper.Map<Book>(request);
        book.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Books.AddAsync(book);
        await _unitOfWork.SaveChangesAsync();

        var bookDto = _mapper.Map<BookDto>(book);
        return ApiResponse<BookDto>.SuccessResponse(bookDto, "Book created successfully.");
    }

    public async Task<ApiResponse<BookDto>> UpdateBookAsync(UpdateBookRequestDto request)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(request.Id);
        if (book == null)
            throw new NotFoundException($"Book with ID {request.Id} not found.");

        // Verify Category and Author exist
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null) throw new NotFoundException($"Category with ID {request.CategoryId} not found.");

        var author = await _unitOfWork.Authors.GetByIdAsync(request.AuthorId);
        if (author == null) throw new NotFoundException($"Author with ID {request.AuthorId} not found.");

        _mapper.Map(request, book);
        book.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Books.Update(book);
        await _unitOfWork.SaveChangesAsync();

        var bookDto = _mapper.Map<BookDto>(book);
        return ApiResponse<BookDto>.SuccessResponse(bookDto, "Book updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteBookAsync(int id)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(id);
        if (book == null)
            throw new NotFoundException($"Book with ID {id} not found.");

        _unitOfWork.Books.Delete(book);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Book deleted successfully.");
    }

    public async Task<ApiResponse<BookDto>> UploadCoverImageAsync(int id, Stream imageStream, string fileName)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(id);
        if (book == null)
            throw new NotFoundException($"Book with ID {id} not found.");

        if (!string.IsNullOrEmpty(book.CoverImageUrl))
        {
            _imageService.DeleteImage(book.CoverImageUrl);
        }

        var imageUrl = await _imageService.UploadImageAsync(imageStream, fileName, "books");
        
        book.CoverImageUrl = imageUrl;
        _unitOfWork.Books.Update(book);
        await _unitOfWork.SaveChangesAsync();

        var bookDto = _mapper.Map<BookDto>(book);
        return ApiResponse<BookDto>.SuccessResponse(bookDto, "Cover image uploaded successfully.");
    }
}
