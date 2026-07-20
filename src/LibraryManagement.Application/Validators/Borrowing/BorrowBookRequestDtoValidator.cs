using FluentValidation;
using LibraryManagement.Application.DTOs.Borrowing;

namespace LibraryManagement.Application.Validators.Borrowing;

public class BorrowBookRequestDtoValidator : AbstractValidator<BorrowBookRequestDto>
{
    public BorrowBookRequestDtoValidator()
    {
        RuleFor(x => x.BookId)
            .GreaterThan(0).WithMessage("Book ID is required.");
    }
}
