import { supabase, isSupabaseConfigured } from './supabase';
import { api } from './api';

/**
 * دالة رفع مجموعة صور لسيارة معينة إلى Supabase Storage (حاوية car-images)،
 * واستخراج الروابط المباشرة وحفظها تلقائياً داخل عمود images في جدول vehicles.
 */
export async function uploadAndSaveCarImages(
  carId: string,
  files: FileList | File[],
  existingImages: string[] = []
): Promise<string[]> {
  const newUrls: string[] = [];

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;

    // 1. إنشاء اسم فريد للملف لتجنب استبدال الصور المتشابهة
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${carId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    let publicUrl = '';

    if (isSupabaseConfigured) {
      // 2. رفع الصورة إلى Supabase Storage في حاوية car-images
      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw new Error(`فشل رفع الصورة ${file.name}: ${uploadError.message}`);
      }

      // 3. استخراج الرابط المباشر العام (Public URL)
      const { data: urlData } = supabase.storage
        .from('car-images')
        .getPublicUrl(cleanFileName);

      publicUrl = urlData.publicUrl;
    } else {
      // احتياطي محلي في حال عدم الاتصال المباشر
      const reader = new FileReader();
      const readPromise = new Promise<string>((resolve) => {
        reader.onload = (event) => resolve(event.target?.result as string);
      });
      reader.readAsDataURL(file);
      publicUrl = await readPromise;
    }

    if (publicUrl) {
      newUrls.push(publicUrl);

      // حفظ في جدول vehicle_images ومزامنتها محلياً وسحابياً
      try {
        await api.addVehicleImage(carId, publicUrl, existingImages.length === 0 && newUrls.length === 1);
      } catch (err) {
        console.warn('Error syncing vehicle_images table:', err);
      }
    }
  }

  // 4. دمج الروابط الجديدة مع الروابط السابقة
  const updatedImagesList = [...existingImages, ...newUrls];

  // 5. حفظ مصفوفة الروابط في عمود images في جدول vehicles
  if (isSupabaseConfigured) {
    try {
      const { error: dbError } = await supabase
        .from('vehicles')
        .update({ images: updatedImagesList })
        .eq('id', carId);

      if (dbError) {
        console.warn('Supabase update vehicles.images warning:', dbError.message);
      }
    } catch (dbErr) {
      console.warn('Database images update error:', dbErr);
    }
  }

  return updatedImagesList;
}

/**
 * دالة حذف صورة من Supabase Storage ومن جدول السيارات
 */
export async function deleteCarImage(
  carId: string,
  imageUrl: string,
  currentImages: string[]
): Promise<string[]> {
  const updatedImages = currentImages.filter((url) => url !== imageUrl);

  // استخراج اسم الملف داخل الحاوية من الرابط
  try {
    const parts = imageUrl.split('/car-images/');
    if (parts.length > 1) {
      const storageFilePath = decodeURIComponent(parts[1]);
      if (isSupabaseConfigured) {
        await supabase.storage.from('car-images').remove([storageFilePath]);
      }
    }
  } catch (err) {
    console.warn('Error deleting from storage bucket:', err);
  }

  // تحديث قاعدة البيانات
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('vehicles')
        .update({ images: updatedImages })
        .eq('id', carId);
    } catch (dbErr) {
      console.warn('Database images update error:', dbErr);
    }
  }

  return updatedImages;
}
