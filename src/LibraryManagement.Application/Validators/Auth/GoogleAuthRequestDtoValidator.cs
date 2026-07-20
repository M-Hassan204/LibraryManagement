using FluentValidation;
using LibraryManagement.Application.DTOs.Auth;

namespace LibraryManagement.Application.Validators.Auth;

public class GoogleAuthRequestDtoValidator : AbstractValidator<GoogleAuthRequestDto>
{
    public GoogleAuthRequestDtoValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("Google ID token is required.");
    }
}
