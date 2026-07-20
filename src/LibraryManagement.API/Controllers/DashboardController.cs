using LibraryManagement.Application.DTOs.Dashboard;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

[Authorize(Roles = AppRoles.Admin)]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStatistics()
    {
        return Ok(await _dashboardService.GetStatisticsAsync());
    }
}
