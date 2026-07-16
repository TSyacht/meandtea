import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Film, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadImage, deleteFile } from '../../services/storageService';
import { supabaseUrl } from '../../db';
import toast from 'react-hot-toast';

interface VideoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onDelete?: (path: string) => void;
  label?: string;
  hint?: string;
  aspectRatio?: string;
  bucket?: string;
  pathPrefix?: string;
  useOriginalName?: boolean;
  customFileName?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  value, 
  onChange,
  onDelete,
  label = "上傳影片", 
  hint = "建議上傳經過 Web 最佳化壓縮的 MP4 格式",
  aspectRatio = "aspect-video",
  bucket = "products",
  pathPrefix = "",
  useOriginalName = false,
  customFileName
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // Accept standard video types
    if (!file.type.startsWith('video/')) {
      toast.error('請上傳影片檔案 (例如 MP4)');
      return;
    }

    const oldValue = value;
    setIsUploading(true);
    const loadingToast = toast.loading('正在上傳影片...');

    try {
      // Re-use uploadImage which is completely generic for all files
      const publicUrl = await uploadImage(file, bucket, pathPrefix, useOriginalName, customFileName);
      
      // If there was an old value, delete it from storage to save space
      if (oldValue && oldValue !== publicUrl) {
        if (!oldValue.startsWith('http') && !oldValue.includes('placeholder')) {
          console.log(`Auto-deleting old file: ${oldValue}`);
          await deleteFile(oldValue, bucket);
          if (onDelete) onDelete(oldValue);
        }
      }

      onChange(publicUrl);
      toast.success('影片上傳成功', { id: loadingToast });
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || error.error_description || '影片上傳失敗，請檢查 Supabase Storage 設定';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, value, bucket, pathPrefix, useOriginalName, customFileName, onDelete]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">{label}</label>}
      
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative ${aspectRatio} rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden group
          ${isDragging ? 'border-[#707040] bg-[#707040]/5' : 'border-stone-200 hover:border-stone-300 bg-stone-50'}
          ${value && !isUploading ? 'border-none' : ''}
          ${isUploading ? 'cursor-not-allowed opacity-70' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="video/*"
          className="hidden"
          disabled={isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <Loader2 className="w-10 h-10 text-[#707040] animate-spin mb-4" />
              <p className="text-sm font-bold text-stone-500">正在上傳影片中...</p>
            </motion.div>
          ) : value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative bg-black"
            >
              <video
                src={value.startsWith('http') ? value : `${(supabaseUrl || 'https://ftqyzxrvghfdspgjampd.supabase.co').replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${value}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 text-stone-800 px-6 py-3 rounded-xl text-xs font-bold tracking-widest flex items-center gap-2">
                  <Upload size={14} /> 更換影片
                </div>
              </div>
              <button
                onClick={removeVideo}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors shadow-sm z-10"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-stone-300 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Film size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 mb-1">點擊或拖曳影片至此</p>
              <p className="text-xs text-stone-400">支援 MP4, WebM 等影片格式</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hint && (
        <p className="text-xs text-stone-400 leading-normal mt-1.5 ml-1">
          {hint}
        </p>
      )}
    </div>
  );
};
