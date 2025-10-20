import * as ExifReader from 'exifreader';

const readFileAsDataURLAsync = (file: File): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // event.target.result is always string or ArrayBuffer | null
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(null);
      }
    };
    reader.onerror = () => {
      reject(null);
    };
    reader.readAsDataURL(file);
  });
};

const fixImageOnCanvas = (dataUrl: string, orientation: number): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {

        // set proper canvas dimensions before transform & export
        if (4 < orientation && orientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        // browser: this unfixes orientation. the canvas fixed the orientation itself
        // maybe, orientation fixes have to be applie on a per-platofmr-version basis
        /*
        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          default: break;
        }*/
    
        ctx.drawImage(img, 0, 0);
    
        canvas.toBlob((fixedImage) => {
          if (fixedImage) {
            resolve(fixedImage)
          } else {
            reject (null);
          }
        }, 'image/jpg');
      } else {
        reject(null);
      }

    }

    img.onerror = (error) => {
      reject(null);
    }

    img.src = dataUrl;
  });
}

export const fixImageOrientation = async (imageFile: File): Promise<Blob | null> => {
  
  const tags = await ExifReader.load(imageFile);
  const orientationTag = tags.Orientation;

  if (orientationTag) {

    const orientation = orientationTag.value as number;

    const dataUrl = await readFileAsDataURLAsync(imageFile);

    //console.log(dataUrl)

    if (dataUrl) {
      const fixedImage = await fixImageOnCanvas(dataUrl, orientation);

      if (fixedImage) {
        return fixedImage;
      }
    }    
  }

  return null;
};
