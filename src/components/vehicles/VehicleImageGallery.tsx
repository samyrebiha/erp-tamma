import React, { useState, useRef } from 'react';
import { Camera, Plus, Trash2, Star, Image as ImageIcon, Eye, X, UploadCloud } from 'lucide-react';
import { VehicleImage } from '../../types';
import { Button } from '../ui/Button';
import { uploadAndSaveCarImages, deleteCarImage } from '../../lib/storage';

interface VehicleImageGalleryProps {
  vehicleId: string;
  images: VehicleImage[];
  isEditable?: boolean;
  onAddImage?: (dataUrl: string, isPrimary: boolean) => Promise<void>;
  onRemoveImage: (imageId: string) => Promise<void>;
  onSetPrimary: (imageId: string) => Promise<void>;
  onImagesUpdated?: () => Promise<void>;
}

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({
  vehicleId,
  images = [],
  isEditable = true,
  onAddImage,
  onRemoveImage,
  onSetPrimary,
  onImagesUpdated,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const existingUrls = images.map((img) => img.storage_path);
      
      // رفع الصور مباشرة إلى سحابة Supabase Storage في حاوية car-images وحفظ الرابط في قاعدة البيانات
      await uploadAndSaveCarImages(vehicleId, files, existingUrls);

      if (onImagesUpdated) {
        await onImagesUpdated();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'حدث خطأ أثناء رفع وحفظ الصور في سحابة Supabase');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const primaryImage = images.find((img) => img.is_primary) || images[0];

  return (
    <div className="space-y-4">
      {/* معاينة الصورة الرئيسية الكبيرة أو رسالة عدم وجود صور */}
      <div className="relative rounded-card overflow-hidden bg-slate-900 border border-border h-64 sm:h-80 flex items-center justify-center">
        {primaryImage ? (
          <>
            <img
              src={primaryImage.storage_path}
              alt="صورة السيارة الرئيسية"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-badge text-[11px] font-bold bg-navy/80 text-white backdrop-blur-sm border border-white/20">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                الصورة الرئيسية
              </span>
            </div>
            <button
              onClick={() => setSelectedImage(primaryImage.storage_path)}
              className="absolute bottom-3 left-3 p-2 rounded-[8px] bg-black/60 text-white hover:bg-black/80 transition-colors"
              title="تكبير الصورة"
            >
              <Eye className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-center p-6 text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">لم يتم إرفاق صور لهذه السيارة بعد</p>
            <p className="text-[11px] text-slate-500 mt-1">
              الصور اختيارية، وتساعد في توثيق الفحص والطباعة في بطاقة السيارة الرسمية
            </p>
          </div>
        )}
      </div>

      {/* شريط الإجراءات والمصغرات */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-text-primary">
          معرض صور السيارة ({images.length} صور)
        </span>

        {isEditable && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              icon={<Camera className="w-4 h-4" />}
            >
              إضافة صور للسيارة
            </Button>
          </div>
        )}
      </div>

      {/* شبكة الصور المصغرة */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-[8px] overflow-hidden border-2 aspect-4/3 bg-slate-100 ${
                img.is_primary ? 'border-primary' : 'border-border'
              }`}
            >
              <img
                src={img.storage_path}
                alt="مصغرة السيارة"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(img.storage_path)}
              />

              {/* أزرار التحكم بالصورة عند التحويم */}
              {isEditable && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {!img.is_primary && (
                    <button
                      onClick={() => onSetPrimary(img.id)}
                      className="p-1 rounded bg-white/90 text-navy hover:text-primary hover:bg-white transition-colors"
                      title="تعيين كصورة رئيسية"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveImage(img.id)}
                    className="p-1 rounded bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                    title="حذف هذه الصورة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {img.is_primary && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* نافذة التكبير الكبيرة (Lightbox Modal) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 p-2 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="تكبير صورة السيارة"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
};
