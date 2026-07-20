namespace LibraryManagement.Application.Interfaces.Services;

public interface IImageService
{
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string folderName);
    void DeleteImage(string imageUrl);
}
