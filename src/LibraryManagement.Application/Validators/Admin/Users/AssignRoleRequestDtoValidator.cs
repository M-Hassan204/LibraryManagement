using FluentValidation;

namespace LibraryManagement.Application.Validators.Admin.Users;

public class AssignRoleRequestDtoValidator : AbstractValidator<DTOs.Admin.Users.AssignRoleRequestDto>
{
    public AssignRoleRequestDtoValidator()
    {
        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.");
    }
}
