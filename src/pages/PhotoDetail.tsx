import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '../services/firebase';
import { Photo } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  User 
} from 'lucide-react';

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchPhotoDetails = async () => {
      if (!id) return;
      setLoading(true);
      setErrorObj(null);
      try {
        const data = await dbService.getPhotoById(id);
        if (data) {
          setPhoto(data);
        } else {
          setErrorObj('找不到該攝影作品，可能已被主人刪除。');
        }
      } catch (err) {
        setErrorObj('讀取作品資訊時發生錯誤，請重新整理試試。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!photo) return;
    setIsDeleting(true);
    try {
      await dbService.deletePhoto(photo.id);
      navigate('/');
    } catch (err: any) {
      setErrorObj(err.message || '刪除失敗');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const isOwner = currentUser && photo && (currentUser.uid === photo.userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-gold mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">載入高畫質光影細節中...</p>
      </div>
    );
  }

  if (errorObj || !photo) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">無法找到此作品</h2>
        <p className="text-zinc-500 text-xs max-w-sm mb-6">{errorObj || '作品不存在'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-widest border border-white/10 transition-colors"
        >
          返回展廊首頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 relative overflow-hidden">
      
      {/* Atmosphere Glow Overlays */}
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Top Breadcrumb & Controls */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-gold text-xs uppercase tracking-widest font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回前頁
        </button>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/edit-photo/${photo.id}`}
              className="flex items-center gap-1.5 bg-[#0A0A0A]/40 border border-white/10 hover:border-gold/30 hover:bg-white/10 text-zinc-300 font-bold py-2 px-4 rounded text-[10px] uppercase tracking-widest transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-gold" />
              編輯作品
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 font-bold py-2 px-4 rounded text-[10px] uppercase tracking-widest transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              刪除
            </button>
          </div>
        )}
      </div>

      {/* Main Detail Presentation Container */}
      <div className="max-w-6xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main HD Image display screen */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden shadow-2xl relative p-2">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain max-h-[75vh] mx-auto bg-black"
            />
          </div>
        </div>

        {/* Detailed Metadata Spec sheet panel */}
        <div className="lg:col-span-4 bg-[#0A0A0A]/80 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div>
            <div className="inline-flex items-center gap-1 bg-gold/10 text-gold text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-widest border border-gold/20 mb-4">
              <Tag className="w-3 h-3 text-gold" />
              {photo.category}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-normal break-words">
              {photo.title}
            </h1>
            
            <span className="text-[10px] text-zinc-500 font-mono block mt-1 uppercase tracking-wider">
              PUBLISHED AT {new Date(photo.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Description Section */}
          <div className="border-t border-b border-white/5 py-5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
              作品理念與細節故事 (CONCEPT DETAIL)
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line font-sans">
              {photo.description || '這部作品尚未撰寫任何背景理念或鏡頭參數細部故事。'}
            </p>
          </div>

          {/* Specification Sheets */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono mb-2">
              參數規格 (SHUTTER LOG)
            </h3>
            
            {/* Location row */}
            <div className="flex gap-3 items-center text-xs">
              <div className="w-8 h-8 rounded bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[9.5px] text-zinc-500 uppercase block font-mono">拍攝位置</span>
                <span className="text-zinc-300 font-medium text-xs">{photo.location || '未提供拍攝地點'}</span>
              </div>
            </div>

            {/* Shoot date row */}
            <div className="flex gap-3 items-center text-xs">
              <div className="w-8 h-8 rounded bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[9.5px] text-zinc-500 uppercase block font-mono">拍攝日期</span>
                <span className="text-zinc-300 font-mono font-medium text-xs">{photo.shootDate}</span>
              </div>
            </div>

            {/* Author uid row */}
            <div className="flex gap-3 items-center text-xs font-mono">
              <div className="w-8 h-8 rounded bg-gold/5 border border-gold/15 flex items-center justify-center text-gold shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[9.5px] text-zinc-500 uppercase block font-mono">創作者身分編號</span>
                <span className="text-zinc-400 font-mono text-xs truncate max-w-[180px] block">
                  {photo.userId === 'system-admin' ? 'Shutter 官方系統' : photo.userId}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Confirm Delete Popup overlay */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-white mb-1.5">確定永久刪除？</h3>
            <p className="text-zinc-500 text-xs mb-6 px-2 leading-relaxed">
              您即將刪除「{photo.title}」。此操作將永久從資料庫中清除該檔案且無法復原。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded text-[11px] uppercase tracking-wider transition-colors border border-white/10"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold py-2 rounded text-[11px] uppercase tracking-wider transition-colors border border-red-500/20 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    正在永久移除
                  </>
                ) : (
                  '確定永久刪除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
