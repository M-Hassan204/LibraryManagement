using LibraryManagement.Application.DTOs.Reading;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class ReadingService : IReadingService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReadingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ReadBookResponseDto>> ReadBookOnlineAsync(string userId, int bookId, ReadBookRequestDto request)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(bookId);
        if (book == null)
            throw new NotFoundException("Book not found.");

        var subscription = await _unitOfWork.Subscriptions.Query()
            .Where(s => s.UserId == userId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.EndDate)
            .FirstOrDefaultAsync();

        bool isFree = subscription == null || subscription.Plan == SubscriptionPlanType.Free;
        bool hasReachedLimit = false;

        if (isFree)
        {
            var today = DateTime.UtcNow.Date;
            var dailyReading = await _unitOfWork.DailyReadingLimits.Query()
                .Where(r => r.UserId == userId && r.Date == today)
                .FirstOrDefaultAsync();

            if (dailyReading == null)
            {
                dailyReading = new DailyReadingLimit
                {
                    UserId = userId,
                    Date = today,
                    PagesRead = 0
                };
                await _unitOfWork.DailyReadingLimits.AddAsync(dailyReading);
                // Save changes below
            }

            if (dailyReading.PagesRead >= 20)
            {
                hasReachedLimit = true;
                if (request.PageNumber > 20)
                {
                    throw new BusinessRuleException("Free plan allows reading a maximum of 20 pages per day. Upgrade to Premium for unlimited reading.");
                }
            }
            else
            {
                // Increment page count
                // In a real scenario, we track distinct pages, but here we'll just increment up to 20 for simplicity
                dailyReading.PagesRead++;
                _unitOfWork.DailyReadingLimits.Update(dailyReading);
                await _unitOfWork.SaveChangesAsync();
                
                if (dailyReading.PagesRead >= 20)
                {
                    hasReachedLimit = true;
                }
            }
        }

        // Dummy book content
        int totalPages = 300; // Assume all books have 300 pages for demo
        
        if (request.PageNumber > totalPages)
            throw new BusinessRuleException("Page number exceeds total pages.");

        var response = new ReadBookResponseDto
        {
            BookId = bookId,
            PageNumber = request.PageNumber,
            Content = $"This is the dummy content for page {request.PageNumber} of the book '{book.Title}'. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            TotalPages = totalPages,
            HasReachedLimit = hasReachedLimit
        };

        return ApiResponse<ReadBookResponseDto>.SuccessResponse(response, "Page retrieved successfully.");
    }
}
