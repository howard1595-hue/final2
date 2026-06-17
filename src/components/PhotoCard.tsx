import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Eye, Edit3, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Photo } from '../types';
import { useAuth } from '../context/AuthContext';

interface PhotoCardProps {
  photo: Photo;
  onDelete?: (id: string) => Promise<void>;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete }) => {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const isOwner = currentUser && (currentUser.uid === photo.userId);

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setErrorObj(null);
    try {
      await onDelete(photo.id);
      setShowConfirm(false);
    } catch (err: any) {
      setErrorObj(err.message || '刪除失敗');
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-[#121212] border border-white/5 hover:border-gold/20 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col h-full relative">
      
      {/* Category Ribbon / Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-gold text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
        <Tag className="w-3 h-3 text-gold" />
        {photo.category}
      </div>

      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 origin-center"
          loading="lazy"
        />
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/20 opacity-70" />
      </div>

      {/* Text / Desc */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-serif font-medium text-white group-hover:text-gold transition-colors line-clamp-1 mb-1">
            {photo.title}
          </h3>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed h-8">
            {photo.description || '無詳細作品故事與拍攝理念...'}
          </p>
        </div>

        {/* Info Row (Sleek Horizontal Presentation) */}
        <div className="flex justify-between items-center text-[10.5px] text-zinc-500 pb-3.5 border-b border-white/5 mb-3.5">
          <span className="truncate max-w-[120px]">{photo.location || '未知地點'}</span>
          <span className="font-mono shrink-0">{photo.shootDate}</span>
        </div>

        {/* Buttons / Dynamic Controls */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {/* View Details */}
          <Link
            to={`/photo/${photo.id}`}
            className="flex-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-100 rounded transition-colors"
          >
            檢視
          </Link>

          {/* Owner specific functions */}
          {isOwner && (
            <div className="flex gap-1.5">
              <Link
                to={`/edit-photo/${photo.id}`}
                className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 rounded transition-all"
                title="編輯作品"
              >
                編輯
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 rounded transition-all"
                title="刪除作品"
              >
                刪除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-20 p-5 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-serif font-bold text-white mb-1.5">確定刪除此攝影作品？</h4>
          <p className="text-zinc-500 text-[11px] mb-4 leading-normal max-w-[220px]">
            刪除永不可還原。將一併清除雲端資料庫。
          </p>

          {errorObj && (
            <p className="text-[10px] text-red-400 bg-red-950/35 px-2.5 py-1 rounded border border-red-900/40 mb-3 w-full">
              {errorObj}
            </p>
          )}

          <div className="flex gap-2 w-full max-w-[200px]">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors border border-white/10"
            >
              取消
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors border border-red-500/20 flex items-center justify-center gap-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin animate-infinite" />
                  刪除中
                </>
              ) : (
                '確認'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
