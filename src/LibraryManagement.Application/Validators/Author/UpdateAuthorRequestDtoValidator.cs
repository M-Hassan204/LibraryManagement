using FluentValidation;
using LibraryManagement.Application.DTOs.Author;

namespace LibraryManagement.Application.Validators.Author;

public class UpdateAuthorRequestDtoValidator : AbstractValidator<UpdateAuthorRequestDto>
{
    public UpdateAuthorRequestDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Author ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Author name is required.")
            .MaximumLength(150).WithMessage("Author name cannot exceed 150 characters.");

        RuleFor(x => x.Biography)
            .MaximumLength(1000).WithMessage("Biography cannot exceed 1000 characters.");
    }
}
