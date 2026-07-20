using LibraryManagement.Application.DTOs.Borrowing;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class BorrowingService : IBorrowingService
{
    private readonly IUnitOfWork _unitOfWork;

    public BorrowingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<BorrowingDto>> BorrowBookAsync(string userId, BorrowBookRequestDto request)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
        if (book == null)
            throw new NotFoundException("Book not found.");

        if (book.Status != BookStatus.Available || book.AvailableCopies <= 0)
            throw new BusinessRuleException("Book is not currently available for borrowing.");

        // Check if user has reached borrowing limit (e.g., 3 active borrowings)
        var activeBorrowings = await _unitOfWork.BorrowingRecords.FindAsync(b => b.UserId == userId && b.Status == BorrowingStatus.Active);
        if (activeBorrowings.Count() >= 3)
            throw new BusinessRuleException("You have reached the maximum limit of active borrowings.");

        // Check if user already has this specific book active
        if (activeBorrowings.Any(b => b.BookId == request.BookId))
            throw new BusinessRuleException("You already have an active borrowing for this book.");

        var borrowing = new BorrowingRecord
        {
            UserId = userId,
            BookId = request.BookId,
            BorrowedAt = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(14), // 2 weeks default
            Status = BorrowingStatus.Active
        };

        book.AvailableCopies -= 1;
        if (book.AvailableCopies == 0)
        {
            book.Status = BookStatus.Borrowed;
        }

        await _unitOfWork.BorrowingRecords.AddAsync(borrowing);
        _unitOfWork.Books.Update(book);
        await _unitOfWork.SaveChangesAsync();

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            BookId = borrowing.BookId,
            BookTitle = book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            Status = borrowing.Status
        };

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Book borrowed successfully.");
    }

    public async Task<ApiResponse<BorrowingDto>> ReturnBookAsync(int borrowingId, ReturnBookRequestDto request)
    {
        var borrowing = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .FirstOrDefaultAsync(b => b.Id == borrowingId);

        if (borrowing == null)
            throw new NotFoundException("Borrowing record not found.");

        if (borrowing.Status == BorrowingStatus.Returned)
            throw new BusinessRuleException("This book has already been returned.");

        borrowing.ReturnedAt = DateTime.UtcNow;
        borrowing.Notes = request.Notes;
        
        if (borrowing.ReturnedAt.Value > borrowing.DueDate)
        {
            borrowing.Status = BorrowingStatus.Overdue; // Ideally we'd have a separate field, but keeping it simple
        }
        else
        {
            borrowing.Status = BorrowingStatus.Returned;
        }

        var book = borrowing.Book;
        book.AvailableCopies += 1;
        book.Status = BookStatus.Available;

        _unitOfWork.BorrowingRecords.Update(borrowing);
        _unitOfWork.Books.Update(book);
        await _unitOfWork.SaveChangesAsync();

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            BookId = borrowing.BookId,
            BookTitle = book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            ReturnedAt = borrowing.ReturnedAt,
            Status = borrowing.Status,
            Notes = borrowing.Notes
        };

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Book returned successfully.");
    }

    public async Task<ApiResponse<IEnumerable<BorrowingDto>>> GetUserBorrowingsAsync(string userId)
    {
        var borrowings = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BorrowedAt)
            .ToListAsync();

        var dtos = borrowings.Select(b => new BorrowingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            BookId = b.BookId,
            BookTitle = b.Book.Title,
            BorrowedAt = b.BorrowedAt,
            DueDate = b.DueDate,
            ReturnedAt = b.ReturnedAt,
            Status = b.Status,
            Notes = b.Notes
        });

        return ApiResponse<IEnumerable<BorrowingDto>>.SuccessResponse(dtos, "Borrowings retrieved successfully.");
    }

    public async Task<ApiResponse<PagedResult<BorrowingDto>>> GetAllBorrowingsAsync(ResourceParameters parameters)
    {
        var query = _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .Include(b => b.User)
            .AsQueryable();

        // Optional filtering by status, or search by book title/user name
        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var search = parameters.SearchTerm.ToLower();
            query = query.Where(b => b.Book.Title.ToLower().Contains(search) 
                                  || b.User.FirstName.ToLower().Contains(search)
                                  || b.User.LastName.ToLower().Contains(search));
        }

        query = query.OrderByDescending(b => b.BorrowedAt);

        var totalCount = await query.CountAsync();

        var borrowings = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var dtos = borrowings.Select(b => new BorrowingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            BookId = b.BookId,
            BookTitle = b.Book.Title,
            BorrowedAt = b.BorrowedAt,
            DueDate = b.DueDate,
            ReturnedAt = b.ReturnedAt,
            Status = b.Status,
            Notes = b.Notes
        }).ToList();

        var pagedResult = PagedResult<BorrowingDto>.Create(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return ApiResponse<PagedResult<BorrowingDto>>.SuccessResponse(pagedResult, "All borrowings retrieved successfully.");
    }

    public async Task<ApiResponse<BorrowingDto>> GetBorrowingByIdAsync(int id)
    {
        var borrowing = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (borrowing == null)
            throw new NotFoundException("Borrowing record not found.");

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            BookId = borrowing.BookId,
            BookTitle = borrowing.Book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            ReturnedAt = borrowing.ReturnedAt,
            Status = borrowing.Status,
            Notes = borrowing.Notes
        };

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Borrowing retrieved successfully.");
    }
}
