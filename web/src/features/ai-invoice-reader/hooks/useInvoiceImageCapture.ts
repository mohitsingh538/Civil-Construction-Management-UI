import { useCallback } from 'react';

const ACCEPT_TYPES = 'application/pdf,image/jpeg,image/png,image/webp,image/bmp,image/tiff';

function pickFile(accept: string, capture?: 'environment' | 'user'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) input.setAttribute('capture', capture);
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export function useInvoiceImageCapture() {
  const pickFromGallery = useCallback((): Promise<File | null> => {
    return pickFile(ACCEPT_TYPES);
  }, []);

  const captureFromCamera = useCallback((): Promise<File | null> => {
    // Camera capture only supports images, not PDF
    return pickFile('image/*', 'environment');
  }, []);

  const pickFromFileInput = useCallback((): Promise<File | null> => {
    return pickFile(ACCEPT_TYPES);
  }, []);

  return { pickFromGallery, captureFromCamera, pickFromFileInput };
}
