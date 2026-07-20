using LibraryManagement.Application.DTOs.Category;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(int id);
    Task<ApiResponse<IEnumerable<CategoryDto>>> GetAllCategoriesAsync();
    Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryRequestDto request);
    Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(UpdateCategoryRequestDto request);
    Task<ApiResponse<bool>> DeleteCategoryAsync(int id);
}
