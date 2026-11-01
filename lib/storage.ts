import { createClient } from './supabase/client';

/**
 * Converts a base64 data URL to a binary Blob
 */
function dataURItoBlob(dataURI: string): { blob: Blob; mimeType: string } {
  const [header, base64Data] = dataURI.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return { blob: new Blob([ab], { type: mimeType }), mimeType };
}

/**
 * Upload an avatar to Supabase Storage and return its public URL.
 * Falls back safely to data URL if Supabase is offline or unconfigured.
 */
export async function uploadAvatar(fileOrDataUrl: string | File, userId: string): Promise<string> {
  const supabase = createClient();
  if (!supabase) {
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  try {
    let blob: Blob;
    let ext = 'jpg';

    if (typeof fileOrDataUrl === 'string') {
      if (!fileOrDataUrl.startsWith('data:')) {
        return fileOrDataUrl; // Already a remote URL
      }
      const parsed = dataURItoBlob(fileOrDataUrl);
      blob = parsed.blob;
      ext = parsed.mimeType.split('/')[1] || 'jpg';
    } else {
      blob = fileOrDataUrl;
      ext = fileOrDataUrl.name.split('.').pop() || 'jpg';
    }

    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });

    if (uploadError) {
      console.warn('Avatar storage upload warning:', uploadError.message);
      if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
      return '';
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn('Storage upload error:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return '';
  }
}

/**
 * Upload a profile banner image to Supabase Storage and return its public URL.
 * Falls back safely to data URL if Supabase is offline or unconfigured.
 */
export async function uploadBanner(fileOrDataUrl: string | File, userId: string): Promise<string> {
  const supabase = createClient();
  if (!supabase) {
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  try {
    let blob: Blob;
    let ext = 'jpg';

    if (typeof fileOrDataUrl === 'string') {
      if (!fileOrDataUrl.startsWith('data:')) {
        return fileOrDataUrl; // Already a remote URL
      }
      const parsed = dataURItoBlob(fileOrDataUrl);
      blob = parsed.blob;
      ext = parsed.mimeType.split('/')[1] || 'jpg';
    } else {
      blob = fileOrDataUrl;
      ext = fileOrDataUrl.name.split('.').pop() || 'jpg';
    }

    const path = `${userId}/banner-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });

    if (uploadError) {
      console.warn('Banner storage upload warning:', uploadError.message);
      if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
      return '';
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn('Storage upload error:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return '';
  }
}

/**
 * Upload a quote background image to Supabase Storage and return its public URL.
 * Falls back safely to data URL if Supabase is offline or unconfigured.
 */
export async function uploadQuoteImage(fileOrDataUrl: string | File, userId: string): Promise<string> {
  const supabase = createClient();
  if (!supabase) {
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  try {
    let blob: Blob;
    let ext = 'jpg';

    if (typeof fileOrDataUrl === 'string') {
      if (!fileOrDataUrl.startsWith('data:')) {
        return fileOrDataUrl; // Already a remote URL
      }
      const parsed = dataURItoBlob(fileOrDataUrl);
      blob = parsed.blob;
      ext = parsed.mimeType.split('/')[1] || 'jpg';
    } else {
      blob = fileOrDataUrl;
      ext = fileOrDataUrl.name.split('.').pop() || 'jpg';
    }

    const path = `${userId}/quote-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('quote-images').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });

    if (uploadError) {
      console.warn('Quote image storage upload warning:', uploadError.message);
      if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
      return '';
    }

    const { data } = supabase.storage.from('quote-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn('Storage upload error:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return '';
  }
}

