using FluentValidation;
using LibraryManagement.Application.DTOs.Auth;

namespace LibraryManagement.Application.Validators.Auth;

public class SendOtpRequestDtoValidator : AbstractValidator<SendOtpRequestDto>
{
    public SendOtpRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Purpose)
            .NotEmpty().WithMessage("Purpose is required.");
    }
}
