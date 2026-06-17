import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { Photo } from '../types';
import PhotoCard from '../components/PhotoCard';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  PlusCircle, 
  MapPin, 
  Image as ImageIcon, 
  FolderHeart, 
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPhotos = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const allPhotos = await dbService.getAllPhotos();
      // Filter by current user
      const userPhotos = allPhotos.filter(p => p.userId === currentUser.uid);
      setPhotos(userPhotos);
    } catch (e) {
      console.error("Error loading user photos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPhotos();
  }, [currentUser]);

  const handleDeleteSuccess = async (id: string) => {
    await dbService.deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Compute statistics for premium Dashboard widgets
  const totalCount = photos.length;
  const uniqueLocCount = Array.from(new Set(photos.map(p => p.location?.trim()).filter(Boolean))).length;
  
  // Count by categories in user's library
  const categoryChart = photos.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const favoriteCategory = Object.entries(categoryChart).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || '暫無分類項目';

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 relative overflow-hidden">
      
      {/* Atmosphere Glow Overlays */}
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-[-150px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Top Welcome Panel */}
      <div className="bg-[#0A0A0A]/80 border-b border-white/10 py-12 shadow-lg animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold text-[10px] font-mono font-bold uppercase tracking-wider">
                  創作者控制中心
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  UID: {currentUser?.uid.substring(0, 10)}...
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-normal">
                哈囉，{currentUser?.name || '創作者'}！
              </h1>
              <p className="text-zinc-400 text-xs mt-1.5 font-sans">
                電子信箱 {currentUser?.email} / 歡迎回來管理與更新您個人的獨特攝影瞬間作品集。
              </p>
            </div>
            
            <Link
              to="/add-photo"
              className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-2.5 px-5 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/10"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              發佈新攝影作品
            </Link>
          </div>

          {/* Quick Statistics Panels is incredibly professional and elegant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {/* Total Photos widget */}
            <div className="bg-[#121212]/60 p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
              <div className="w-11 h-11 rounded bg-gold/10 border border-gold/20 flex items-center justify-center text-gold col-span-1 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">上傳作品總數</span>
                <span className="text-xl font-serif font-bold text-white tracking-wider block mt-0.5">{totalCount} <span className="text-[10px] font-sans text-zinc-500">張</span></span>
              </div>
            </div>

            {/* Unique locations widget */}
            <div className="bg-[#121212]/60 p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
              <div className="w-11 h-11 rounded bg-gold/10 border border-gold/20 flex items-center justify-center text-gold col-span-1 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">足跡紀錄地點</span>
                <span className="text-xl font-serif font-bold text-white tracking-wider block mt-0.5">{uniqueLocCount} <span className="text-[10px] font-sans text-zinc-500">個</span></span>
              </div>
            </div>

            {/* Favorite Collection category widget */}
            <div className="bg-[#121212]/60 p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
              <div className="w-11 h-11 rounded bg-gold/10 border border-gold/20 flex items-center justify-center text-gold col-span-1 shrink-0">
                <FolderHeart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">主要創作分類</span>
                <span className="text-xs font-serif font-bold text-white truncate max-w-[130px] block mt-1">{favoriteCategory}</span>
              </div>
            </div>

            {/* Showcase status */}
            <div className="bg-[#121212]/60 p-5 rounded-lg border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all duration-300">
              <div className="w-11 h-11 rounded bg-gold/10 border border-gold/20 flex items-center justify-center text-gold col-span-1 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">展廊首頁曝光</span>
                <span className="text-xs font-serif font-bold text-gold block mt-1">創作者公開展示</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of own creations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-serif font-bold text-white tracking-normal border-l-2 border-gold pl-4">
            我發佈的攝影作品
          </h2>
          <span className="text-[10.5px] text-zinc-500 font-mono tracking-wider">
            {totalCount} WORKS FOUND
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <div className="w-5 h-5 rounded-full border border-white/10 border-t-gold animate-spin mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">正在彙整作品集...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-xl bg-black/40 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-white/5 text-zinc-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Camera className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-serif font-medium text-white mb-2">作品庫空空如也</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-8 leading-snug">
              看來您目前還沒有上傳過任何精緻的攝影作品。現在就來上傳您的第一部攝影創作，與全世界分享美好光影！
            </p>
            <Link
              to="/add-photo"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold px-6 py-2.5 rounded text-xs uppercase tracking-widest transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              立刻發佈作品
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                onDelete={handleDeleteSuccess} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
