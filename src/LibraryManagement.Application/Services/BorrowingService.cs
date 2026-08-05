using LibraryManagement.Application.DTOs.Borrowing;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using LibraryManagement.Application.DTOs.Branch;
using LibraryManagement.Application.DTOs.Delivery;
using LibraryManagement.Application.Utils;

namespace LibraryManagement.Application.Services;

public class BorrowingService : IBorrowingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public BorrowingService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<ApiResponse<BorrowingDto>> BorrowBookAsync(string userId, BorrowBookRequestDto request)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
        if (book == null)
            throw new NotFoundException("Book not found.");

        if (book.Status != BookStatus.Available || book.AvailableCopies <= 0)
            throw new BusinessRuleException("Book is not currently available for borrowing.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found.");

        bool isAdminOrLibrarian = await _userManager.IsInRoleAsync(user, AppRoles.Admin) || 
                                  await _userManager.IsInRoleAsync(user, AppRoles.Librarian);

        int dueDays = 14;
        LibraryBranch? nearestBranch = null;
        DeliveryRequest? deliveryRequest = null;
        double? branchDistance = null;

        if (!isAdminOrLibrarian)
        {
            var subscription = await _unitOfWork.Subscriptions.Query()
                .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            var plan = subscription?.Plan ?? SubscriptionPlanType.None;

            if (plan == SubscriptionPlanType.None)
            {
                throw new BusinessRuleException("You must have an active Free or Premium subscription to borrow books.");
            }

            var activeBorrowings = await _unitOfWork.BorrowingRecords.FindAsync(b => b.UserId == userId && (b.Status == BorrowingStatus.Borrowed || b.Status == BorrowingStatus.Pending));
            if (activeBorrowings.Any(b => b.BookId == request.BookId))
                throw new BusinessRuleException("You already have a pending or active borrowing for this book.");

            if (plan == SubscriptionPlanType.Premium)
            {
                // Premium Rules: up to 10 books active, 30 days due date, Home Delivery
                if (activeBorrowings.Count() >= 10)
                    throw new BusinessRuleException("Premium users can have at most 10 active borrowings.");
                
                if (string.IsNullOrWhiteSpace(request.DeliveryAddress))
                    throw new BusinessRuleException("Delivery address is required for Premium home delivery.");

                dueDays = 30;
                deliveryRequest = new DeliveryRequest
                {
                    UserId = userId,
                    BookId = request.BookId,
                    DeliveryAddress = request.DeliveryAddress,
                    Status = DeliveryStatus.Pending,
                    RequestedDate = DateTime.UtcNow
                };
            }
            else if (plan == SubscriptionPlanType.Free)
            {
                // Free Rules: Max 5 borrowings per month, Nearest Branch pickup
                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;
                var borrowingsThisMonth = await _unitOfWork.BorrowingRecords.FindAsync(b => 
                    b.UserId == userId && 
                    b.BorrowedAt.HasValue && b.BorrowedAt.Value.Month == currentMonth && 
                    b.BorrowedAt.Value.Year == currentYear);

                if (borrowingsThisMonth.Count() >= 5)
                    throw new BusinessRuleException("Free users can borrow a maximum of 5 books per month.");

                if (request.Latitude != null && request.Longitude != null)
                {
                    var branches = await _unitOfWork.LibraryBranches.Query()
                        .Where(b => b.IsActive)
                        .ToListAsync();

                    if (!branches.Any())
                        throw new BusinessRuleException("No active library branches found.");

                    nearestBranch = branches
                        .Select(b => new { Branch = b, Distance = GeoUtils.CalculateDistance(request.Latitude.Value, request.Longitude.Value, b.Latitude, b.Longitude) })
                        .OrderBy(b => b.Distance)
                        .FirstOrDefault()?.Branch;

                    if (nearestBranch != null)
                    {
                        branchDistance = GeoUtils.CalculateDistance(request.Latitude.Value, request.Longitude.Value, nearestBranch.Latitude, nearestBranch.Longitude);
                    }
                }
            }
        }
        else
        {
            // Admin or Librarian can borrow without limits and pick up directly (or we can just skip limits)
            dueDays = 30; 
        }


        var borrowing = new BorrowingRecord
        {
            UserId = userId,
            BookId = request.BookId,
            BorrowedAt = null,
            DueDate = null,
            Status = BorrowingStatus.Pending,
            Notes = request.Notes
        };

        await _unitOfWork.BorrowingRecords.AddAsync(borrowing);
        
        if (deliveryRequest != null)
        {
             // We add it to the context, or it's added via navigation property if we linked it. 
             // Wait, DeliveryRequest has BorrowingRecordId, but BorrowingRecord doesn't have a collection of DeliveryRequests.
             // We need to save borrowing first to get ID. Or just let EF handle it if we set navigation property.
             // Wait, let's just use unit of work directly.
        }

        await _unitOfWork.SaveChangesAsync();

        if (deliveryRequest != null)
        {
            deliveryRequest.BorrowingRecordId = borrowing.Id;
            await _unitOfWork.DeliveryRequests.AddAsync(deliveryRequest);
            await _unitOfWork.SaveChangesAsync();
        }

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            UserName = user != null ? user.FirstName + " " + user.LastName : string.Empty,
            BookId = borrowing.BookId,
            BookTitle = book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            Status = borrowing.Status
        };

        if (nearestBranch != null)
        {
            dto.NearestBranch = new NearestBranchDto
            {
                Id = nearestBranch.Id,
                Name = nearestBranch.Name,
                Governorate = nearestBranch.Governorate,
                City = nearestBranch.City,
                Address = nearestBranch.Address,
                Latitude = nearestBranch.Latitude,
                Longitude = nearestBranch.Longitude,
                Phone = nearestBranch.Phone,
                WorkingHours = nearestBranch.WorkingHours,
                IsActive = nearestBranch.IsActive,
                DistanceKm = Math.Round(branchDistance ?? 0, 2)
            };
        }

        if (deliveryRequest != null)
        {
            dto.DeliveryRequest = new DeliveryRequestDto
            {
                Id = deliveryRequest.Id,
                UserId = deliveryRequest.UserId,
                BookId = deliveryRequest.BookId,
                BookTitle = book.Title,
                DeliveryAddress = deliveryRequest.DeliveryAddress,
                Status = deliveryRequest.Status,
                RequestedDate = deliveryRequest.RequestedDate
            };
        }

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Borrowing request submitted successfully. Please wait for librarian approval.");
    }

    public async Task<ApiResponse<BorrowingDto>> ApproveBorrowingAsync(int id, ApproveBorrowRequestDto request)
    {
        var borrowing = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (borrowing == null)
            throw new NotFoundException("Borrowing request not found.");

        if (borrowing.Status != BorrowingStatus.Pending)
            throw new BusinessRuleException("Only pending requests can be approved.");

        var book = borrowing.Book;
        if (book.AvailableCopies <= 0)
            throw new BusinessRuleException("No copies available to fulfill this request.");

        if (request.DueDate <= request.BorrowDate)
            throw new BusinessRuleException("Due date must be after the borrow date.");

        borrowing.Status = BorrowingStatus.Borrowed;
        borrowing.BorrowedAt = request.BorrowDate;
        borrowing.DueDate = request.DueDate;

        book.AvailableCopies -= 1;
        if (book.AvailableCopies == 0)
        {
            book.Status = BookStatus.Borrowed;
        }

        _unitOfWork.BorrowingRecords.Update(borrowing);
        _unitOfWork.Books.Update(book);

        var deliveryRequest = await _unitOfWork.DeliveryRequests.Query().FirstOrDefaultAsync(d => d.BorrowingRecordId == id);
        if (deliveryRequest != null)
        {
             deliveryRequest.Status = DeliveryStatus.Preparing;
             _unitOfWork.DeliveryRequests.Update(deliveryRequest);
        }

        await _unitOfWork.SaveChangesAsync();

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            UserName = borrowing.User != null ? borrowing.User.FirstName + " " + borrowing.User.LastName : string.Empty,
            BookId = borrowing.BookId,
            BookTitle = book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            Status = borrowing.Status
        };

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Borrowing request approved successfully.");
    }

    public async Task<ApiResponse<BorrowingDto>> RejectBorrowingAsync(int id, RejectBorrowRequestDto request)
    {
        var borrowing = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (borrowing == null)
            throw new NotFoundException("Borrowing request not found.");

        if (borrowing.Status != BorrowingStatus.Pending)
            throw new BusinessRuleException("Only pending requests can be rejected.");

        borrowing.Status = BorrowingStatus.Rejected;
        borrowing.RejectionReason = request.Reason;

        _unitOfWork.BorrowingRecords.Update(borrowing);

        var deliveryRequest = await _unitOfWork.DeliveryRequests.Query().FirstOrDefaultAsync(d => d.BorrowingRecordId == id);
        if (deliveryRequest != null)
        {
             deliveryRequest.Status = DeliveryStatus.Cancelled;
             _unitOfWork.DeliveryRequests.Update(deliveryRequest);
        }

        await _unitOfWork.SaveChangesAsync();

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            UserName = borrowing.User != null ? borrowing.User.FirstName + " " + borrowing.User.LastName : string.Empty,
            BookId = borrowing.BookId,
            BookTitle = borrowing.Book.Title,
            BorrowedAt = borrowing.BorrowedAt,
            DueDate = borrowing.DueDate,
            Status = borrowing.Status,
            RejectionReason = borrowing.RejectionReason
        };

        return ApiResponse<BorrowingDto>.SuccessResponse(dto, "Borrowing request rejected.");
    }

    public async Task<ApiResponse<BorrowingDto>> ReturnBookAsync(int borrowingId, ReturnBookRequestDto request, string userId, bool isAdminOrLibrarian)
    {
        var borrowing = await _unitOfWork.BorrowingRecords.Query()
            .Include(b => b.Book)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == borrowingId);

        if (borrowing == null)
            throw new NotFoundException("Borrowing record not found.");

        if (borrowing.UserId != userId && !isAdminOrLibrarian)
            throw new UnauthorizedAccessException("You are not authorized to return this book.");

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
            UserName = borrowing.User != null ? borrowing.User.FirstName + " " + borrowing.User.LastName : string.Empty,
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
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BorrowedAt)
            .ToListAsync();

        var dtos = borrowings.Select(b => new BorrowingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            UserName = b.User != null ? b.User.FirstName + " " + b.User.LastName : string.Empty,
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
            UserName = b.User != null ? b.User.FirstName + " " + b.User.LastName : string.Empty,
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
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (borrowing == null)
            throw new NotFoundException("Borrowing record not found.");

        var dto = new BorrowingDto
        {
            Id = borrowing.Id,
            UserId = borrowing.UserId,
            UserName = borrowing.User != null ? borrowing.User.FirstName + " " + borrowing.User.LastName : string.Empty,
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
