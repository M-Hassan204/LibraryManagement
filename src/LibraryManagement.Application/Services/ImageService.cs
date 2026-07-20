using LibraryManagement.Application.Interfaces.Services;
using LibraryManagement.Shared.Exceptions;

namespace LibraryManagement.Application.Services;

public class ImageService : IImageService
{
    public ImageService()
    {
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string folderName)
    {
        if (imageStream == null || imageStream.Length == 0)
            throw new ValidationException(new List<string> { "Image stream cannot be empty." });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", folderName);
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(fileName);
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await imageStream.CopyToAsync(fileStream);
        }

        return $"/images/{folderName}/{uniqueFileName}";
    }

    public void DeleteImage(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl)) return;

        var path = imageUrl.TrimStart('/');
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.Replace("/", "\\"));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }
}
