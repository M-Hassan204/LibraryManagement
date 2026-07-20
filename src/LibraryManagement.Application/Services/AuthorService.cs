using AutoMapper;
using LibraryManagement.Application.DTOs.Author;
using LibraryManagement.Application.Interfaces.Repositories;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Entities;
using LibraryManagement.Shared.Exceptions;
using LibraryManagement.Shared.Models;

namespace LibraryManagement.Application.Services;

public class AuthorService : IAuthorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuthorService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<AuthorDto>>> GetAllAuthorsAsync()
    {
        var authors = await _unitOfWork.Authors.GetAllAsync();
        var authorDtos = _mapper.Map<IEnumerable<AuthorDto>>(authors);
        return ApiResponse<IEnumerable<AuthorDto>>.SuccessResponse(authorDtos);
    }

    public async Task<ApiResponse<AuthorDto>> GetAuthorByIdAsync(int id)
    {
        var author = await _unitOfWork.Authors.GetByIdAsync(id);
        if (author == null)
            throw new NotFoundException($"Author with ID {id} not found.");

        var authorDto = _mapper.Map<AuthorDto>(author);
        return ApiResponse<AuthorDto>.SuccessResponse(authorDto);
    }

    public async Task<ApiResponse<AuthorDto>> CreateAuthorAsync(CreateAuthorRequestDto request)
    {
        var author = _mapper.Map<Author>(request);
        author.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Authors.AddAsync(author);
        await _unitOfWork.SaveChangesAsync();

        var authorDto = _mapper.Map<AuthorDto>(author);
        return ApiResponse<AuthorDto>.SuccessResponse(authorDto, "Author created successfully.");
    }

    public async Task<ApiResponse<AuthorDto>> UpdateAuthorAsync(UpdateAuthorRequestDto request)
    {
        var author = await _unitOfWork.Authors.GetByIdAsync(request.Id);
        if (author == null)
            throw new NotFoundException($"Author with ID {request.Id} not found.");

        _mapper.Map(request, author);
        author.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Authors.Update(author);
        await _unitOfWork.SaveChangesAsync();

        var authorDto = _mapper.Map<AuthorDto>(author);
        return ApiResponse<AuthorDto>.SuccessResponse(authorDto, "Author updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteAuthorAsync(int id)
    {
        var author = await _unitOfWork.Authors.GetByIdAsync(id);
        if (author == null)
            throw new NotFoundException($"Author with ID {id} not found.");

        _unitOfWork.Authors.Delete(author);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Author deleted successfully.");
    }
}
