'use client';
import React, { useState } from 'react';

// --- 配置区 ---
const CLOUD_NAME = 'dehf9fvpz'; 
const UPLOAD_PRESET = 'zero_upload'; // <--- 填入你在 Cloudinary 设的 Unsigned Preset 名字

export default function ImageUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
        console.log("上传成功:", data.secure_url);
      } else {
        alert('上传失败，请确认 Cloudinary 的 Preset 设为了 Unsigned');
        console.error("Cloudinary Error:", data);
      }
    } catch (err) {
      alert('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative aspect-[3/4] border-2 border-dashed border-black/10 flex flex-col items-center justify-center bg-[#f9f9f9] group hover:bg-white hover:border-black/30 transition-all cursor-pointer overflow-hidden">
      <input 
        type="file" 
        onChange={handleUpload} 
        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
        disabled={loading}
        accept="image/*"
      />
      {loading ? (
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-[10px] font-black tracking-widest uppercase">Archiving...</p>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-3xl font-light">+</span>
          <p className="text-[10px] font-black uppercase tracking-widest mt-2">Add Design</p>
        </div>
      )}
    </div>
  );
}