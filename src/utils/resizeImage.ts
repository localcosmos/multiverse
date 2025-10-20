/**
 *
 * Resize an image to fit a maximum square and maintain its aspect ratio
 * this does NOT crop the image
 */

const loadImage = (url: string): Promise<HTMLImageElement> => {
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(image);
  });
};

const createBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject('could not create blob')
        }
      },
      'image/jpeg',
      quality,
    );
  });
};

export const resizeImage = async (imageFile: File, size: number, quality: number): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const imageSrc = URL.createObjectURL(imageFile);

  try {
    const image = await loadImage(imageSrc);

    const originalWidth = image.width;
    const originalHeight = image.height;

    let resizingFactor = 1;

    if (originalWidth >= originalHeight) {
      resizingFactor = size / originalWidth;
    } else {
      resizingFactor = size / originalHeight;
    }

    const canvasWidth = Math.round(originalWidth * resizingFactor);
    const canvasHeight = Math.round(originalHeight * resizingFactor);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (context === null) {
      throw new Error('Could not get canvas context');
    }
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(
      image,
      0,
      0,
      originalWidth * resizingFactor,
      originalHeight * resizingFactor,
    );

    try {
      const blob = await createBlob(canvas, quality);
      return blob;
    } catch (e) {
      alert(e);
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
};
