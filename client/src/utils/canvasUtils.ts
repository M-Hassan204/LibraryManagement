import { Area } from 'react-easy-crop';

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  targetWidth: number = 500,
  targetHeight: number = 500
): Promise<File | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the target size for the profile image
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // draw the cropped area of the image onto the canvas, scaled to the target size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.85); // 85% quality JPEG
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
