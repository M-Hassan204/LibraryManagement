using LibraryManagement.Application.DTOs.Dashboard;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Domain.Enums;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetStatisticsAsync()
    {
        var totalBooks = await _unitOfWork.Books.Query().CountAsync();
        
        var totalUsers = await _userManager.Users.CountAsync();
        
        var activeBorrowings = await _unitOfWork.BorrowingRecords.Query()
            .CountAsync(b => b.Status == BorrowingStatus.Active);
            
        var overdueBooks = await _unitOfWork.BorrowingRecords.Query()
            .CountAsync(b => b.Status == BorrowingStatus.Active && b.DueDate < DateTime.UtcNow);

        var topBorrowedBooks = await _unitOfWork.BorrowingRecords.Query()
            .GroupBy(b => new { b.BookId, b.Book.Title })
            .Select(g => new TopBookDto
            {
                BookId = g.Key.BookId,
                Title = g.Key.Title,
                BorrowCount = g.Count()
            })
            .OrderByDescending(t => t.BorrowCount)
            .Take(5)
            .ToListAsync();

        var stats = new DashboardStatsDto
        {
            TotalBooks = totalBooks,
            TotalUsers = totalUsers,
            ActiveBorrowings = activeBorrowings,
            OverdueBooks = overdueBooks,
            TopBorrowedBooks = topBorrowedBooks
        };

        return ApiResponse<DashboardStatsDto>.SuccessResponse(stats, "Dashboard statistics retrieved successfully.");
    }
}
