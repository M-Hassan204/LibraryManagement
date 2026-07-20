using LibraryManagement.Application.DTOs.Category;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

public class CategoryController : BaseApiController
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetAllCategories()
    {
        return Ok(await _categoryService.GetAllCategoriesAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryById(int id)
    {
        return Ok(await _categoryService.GetCategoryByIdAsync(id));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequestDto request)
    {
        return Ok(await _categoryService.CreateCategoryAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryRequestDto request)
    {
        if (id != request.Id)
            return BadRequest(ApiResponse<CategoryDto>.FailureResponse("ID mismatch between URL and body."));

        return Ok(await _categoryService.UpdateCategoryAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(int id)
    {
        return Ok(await _categoryService.DeleteCategoryAsync(id));
    }
}
