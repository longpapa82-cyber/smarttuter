/**
 * Image Optimization Utilities
 *
 * Compresses and resizes images before OCR processing
 * to improve performance and reduce API costs
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'webp' | 'png';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'jpeg',
};

/**
 * Compress and resize image file
 * @param file - Original image file
 * @param options - Optimization options
 * @returns Optimized image file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > opts.maxWidth) {
          width = opts.maxWidth;
          height = width / aspectRatio;
        }

        if (height > opts.maxHeight) {
          height = opts.maxHeight;
          width = height * aspectRatio;
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new file from blob
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${opts.format}`),
              { type: `image/${opts.format}` }
            );

            console.log(`📸 Image optimized: ${formatBytes(file.size)} → ${formatBytes(optimizedFile.size)} (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`);

            resolve(optimizedFile);
          },
          `image/${opts.format}`,
          opts.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Fast optimization for OCR (prioritizes speed over quality)
 * @param file - Original image file
 * @returns Optimized image file
 */
export async function optimizeForOCR(file: File): Promise<File> {
  return optimizeImage(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.9,
    format: 'jpeg',
  });
}

/**
 * Check if image needs optimization
 * @param file - Image file
 * @returns true if optimization recommended
 */
export function shouldOptimize(file: File): boolean {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  return file.size > MAX_SIZE;
}

/**
 * Get image dimensions without loading full image
 * @param file - Image file
 * @returns Width and height
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Batch optimize multiple images
 * @param files - Array of image files
 * @param options - Optimization options
 * @returns Array of optimized files
 */
export async function batchOptimize(
  files: File[],
  options: ImageOptimizationOptions = {}
): Promise<File[]> {
  const promises = files.map((file) => optimizeImage(file, options));
  return Promise.all(promises);
}

/**
 * Convert image to grayscale (improves OCR accuracy for text)
 * @param file - Image file
 * @returns Grayscale image file
 */
export async function convertToGrayscale(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        // Put modified data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const grayscaleFile = new File([blob], file.name, { type: file.type });
            resolve(grayscaleFile);
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Increase image contrast (improves OCR accuracy)
 * @param file - Image file
 * @param factor - Contrast factor (1 = no change, >1 = more contrast)
 * @returns Enhanced image file
 */
export async function enhanceContrast(file: File, factor: number = 1.5): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const contrastFactor = (259 * (factor * 255 + 255)) / (255 * (259 - factor * 255));

        for (let i = 0; i < data.length; i += 4) {
          data[i] = contrastFactor * (data[i] - 128) + 128;
          data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128;
          data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128;
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const enhancedFile = new File([blob], file.name, { type: file.type });
            resolve(enhancedFile);
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
