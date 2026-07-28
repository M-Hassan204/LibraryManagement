using LibraryManagement.Application.DTOs.Subscription;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SubscriptionController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet("my-subscription")]
    [Authorize]
    public async Task<IActionResult> GetMySubscription()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var response = await _subscriptionService.GetUserSubscriptionAsync(userId);
        return Ok(response);
    }


    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllSubscriptions([FromQuery] ResourceParameters parameters)
    {
        var response = await _subscriptionService.GetAllSubscriptionsAsync(parameters);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSubscription(int id, [FromBody] UpdateSubscriptionRequestDto request)
    {
        if (id != request.SubscriptionId)
            return BadRequest(new { Message = "ID mismatch" });

        var response = await _subscriptionService.UpdateSubscriptionAsync(request);
        return Ok(response);
    }
}
