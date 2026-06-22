import { getApiBase } from '../../../lib/api-base';

export const UPLOAD_KINDS = ['branches', 'categories', 'services', 'staff', 'packages'] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

function authHeaders(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  const userId = localStorage.getItem('mit_salon_user_id');
  return userId ? { 'X-User-Id': userId } : {};
}

export const uploadsApi = {
  async uploadImage(file: File, kind: UploadKind): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const base = getApiBase();
    const res = await fetch(`${base}/uploads?kind=${encodeURIComponent(kind)}`, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error((err as { message?: string }).message ?? 'Upload failed');
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  },
};
