const MAX_SOURCE_SIZE = 8 * 1024 * 1024;
const MAX_OUTPUT_SIZE = 600 * 1024;

export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  }
  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error('La imagen supera 8 MB. Selecciona una imagen más pequeña.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 512;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar la imagen.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('No se pudo comprimir la imagen.')), 'image/jpeg', 0.78);
    });
    if (blob.size > MAX_OUTPUT_SIZE) {
      throw new Error('La imagen comprimida supera 600 KB. Elige una foto más sencilla.');
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo leer la imagen.'));
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.readAsDataURL(blob);
    });
  } finally {
    bitmap.close();
  }
}
