using LibraryManagement.Application.DTOs.Author;
using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Domain.Constants;
using LibraryManagement.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers;

public class AuthorController : BaseApiController
{
    private readonly IAuthorService _authorService;

    public AuthorController(IAuthorService authorService)
    {
        _authorService = authorService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<AuthorDto>>>> GetAllAuthors()
    {
        return Ok(await _authorService.GetAllAuthorsAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AuthorDto>>> GetAuthorById(int id)
    {
        return Ok(await _authorService.GetAuthorByIdAsync(id));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<AuthorDto>>> CreateAuthor([FromBody] CreateAuthorRequestDto request)
    {
        return Ok(await _authorService.CreateAuthorAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AuthorDto>>> UpdateAuthor(int id, [FromBody] UpdateAuthorRequestDto request)
    {
        if (id != request.Id)
            return BadRequest(ApiResponse<AuthorDto>.FailureResponse("ID mismatch between URL and body."));

        return Ok(await _authorService.UpdateAuthorAsync(request));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAuthor(int id)
    {
        return Ok(await _authorService.DeleteAuthorAsync(id));
    }
}
