import { createAdminClient } from '@/lib/supabase/admin';

export type StoredObject = { bucket: string; key: string; size?: number; contentType?: string };

/** Provider boundary. Persist bucket/key and metadata; URLs are generated on demand. */
export interface StorageService {
  upload(object: StoredObject, body: Buffer | File | Blob, upsert?: boolean): Promise<void>;
  download(object: StoredObject): Promise<Blob>;
  delete(objects: StoredObject[]): Promise<void>;
  publicUrl(object: StoredObject): string;
  signedUrl(object: StoredObject, expiresInSeconds: number): Promise<string>;
  keyFromPublicUrl(bucket: string, url: string): string | null;
}

class SupabaseStorageService implements StorageService {
  private client = createAdminClient();
  async upload(object: StoredObject, body: Buffer | File | Blob, upsert = false) {
    const { error } = await this.client.storage.from(object.bucket).upload(object.key, body, { upsert, contentType: object.contentType });
    if (error) {
      if (error.message?.toLowerCase().includes("bucket not found")) {
        await this.client.storage.createBucket(object.bucket, { public: true });
        const retry = await this.client.storage.from(object.bucket).upload(object.key, body, { upsert, contentType: object.contentType });
        if (retry.error) throw new Error(retry.error.message);
        return;
      }
      throw new Error(error.message);
    }
  }
  async download(object: StoredObject) {
    const { data, error } = await this.client.storage.from(object.bucket).download(object.key);
    if (error || !data) throw new Error(error?.message || 'File could not be downloaded');
    return data;
  }
  async delete(objects: StoredObject[]) {
    const byBucket = new Map<string, string[]>();
    for (const object of objects) byBucket.set(object.bucket, [...(byBucket.get(object.bucket) || []), object.key]);
    for (const [bucket, keys] of byBucket) {
      const { error } = await this.client.storage.from(bucket).remove(keys);
      if (error) throw new Error(error.message);
    }
  }
  publicUrl(object: StoredObject) { return this.client.storage.from(object.bucket).getPublicUrl(object.key).data.publicUrl; }
  keyFromPublicUrl(bucket: string, url: string) {
    try {
      const pathname = new URL(url).pathname;
      const marker = `/${bucket}/`;
      const index = pathname.indexOf(marker);
      return index < 0 ? null : decodeURIComponent(pathname.slice(index + marker.length));
    } catch { return null; }
  }
  async signedUrl(object: StoredObject, expiresInSeconds: number) {
    const { data, error } = await this.client.storage.from(object.bucket).createSignedUrl(object.key, expiresInSeconds);
    if (error || !data) throw new Error(error?.message || 'Could not create a download link');
    return data.signedUrl;
  }
}

const storageProvider = process.env.STORAGE_PROVIDER || 'supabase';
if (storageProvider !== 'supabase') throw new Error(`Unsupported storage provider: ${storageProvider}`);
export const storageService: StorageService = new SupabaseStorageService();
