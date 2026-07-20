using LibraryManagement.Application.DTOs.Dashboard;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetStatisticsAsync();
}
