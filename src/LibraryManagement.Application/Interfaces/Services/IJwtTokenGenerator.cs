using LibraryManagement.Domain.Entities;

namespace LibraryManagement.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
}
