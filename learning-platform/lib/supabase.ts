import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. File storage will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      error: null,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      url: '',
      error: error as Error,
    }
  }
}

// Helper function to delete file from Supabase Storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error as Error,
    }
  }
}

// Helper function to get file URL
export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
