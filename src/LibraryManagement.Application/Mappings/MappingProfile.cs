using AutoMapper;

namespace LibraryManagement.Application.Mappings;

/// <summary>
/// Centralized AutoMapper profile for the Application layer.
/// Used to map between Domain entities and Data Transfer Objects (DTOs).
/// </summary>
public class MappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of <see cref="MappingProfile"/> and configures mapping rules.
    /// </summary>
    public MappingProfile()
    {
        // Category Mappings
        CreateMap<Domain.Entities.Category, DTOs.Category.CategoryDto>().ReverseMap();
        CreateMap<DTOs.Category.CreateCategoryRequestDto, Domain.Entities.Category>();
        CreateMap<DTOs.Category.UpdateCategoryRequestDto, Domain.Entities.Category>();

        // Author Mappings
        CreateMap<Domain.Entities.Author, DTOs.Author.AuthorDto>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName))
            .ReverseMap();
        CreateMap<DTOs.Author.CreateAuthorRequestDto, Domain.Entities.Author>();
        CreateMap<DTOs.Author.UpdateAuthorRequestDto, Domain.Entities.Author>();

        // Book Mappings
        CreateMap<Domain.Entities.Book, DTOs.Book.BookDto>()
            .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author != null ? src.Author.FullName : string.Empty))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ReverseMap();
        CreateMap<DTOs.Book.CreateBookRequestDto, Domain.Entities.Book>();
        CreateMap<DTOs.Book.UpdateBookRequestDto, Domain.Entities.Book>();

        // Admin User Mappings
        CreateMap<Domain.Entities.ApplicationUser, DTOs.Admin.Users.AdminUserDto>()
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => !src.IsDeleted))
            .ForMember(dest => dest.RegistrationDate, opt => opt.MapFrom(src => src.CreatedAt));
    }
}
