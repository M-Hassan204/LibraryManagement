using LibraryManagement.Application.DTOs.Delivery;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDeliveries([FromQuery] ResourceParameters parameters)
    {
        var response = await _deliveryService.GetAllDeliveriesAsync(parameters);
        return Ok(response);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromBody] UpdateDeliveryStatusDto request)
    {
        var response = await _deliveryService.UpdateDeliveryStatusAsync(id, request);
        return Ok(response);
    }
}
