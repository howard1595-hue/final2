import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import PhotoCard from '../components/PhotoCard';
import { dbService } from '../services/firebase';
import { Photo } from '../types';
import { Camera, Image, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search and Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchPhotos = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await dbService.getAllPhotos();
      setPhotos(data);
    } catch (err) {
      setErrorMsg('無法載入攝影作品，請重試。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDeletePhotoSuccess = async (id: string) => {
    try {
      await dbService.deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      throw new Error(e.message || '無法刪除此作品');
    }
  };

  // Compute unique locations for the filter
  const uniqueLocations: string[] = Array.from(
    new Set(
      photos
        .map((p) => p.location?.trim() || '')
        .filter((loc) => loc !== '')
    )
  ).sort() as string[];

  // Compute count by category
  const countByCategory: Record<string, number> = {};
  photos.forEach((p) => {
    if (p.category) {
      countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
    }
  });

  // Filtered dataset
  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = selectedCategory ? photo.category === selectedCategory : true;
    
    // Lowcase text search matching Title, description, or shooting location
    const sQuery = searchTerm.toLowerCase();
    const matchesSearch = sQuery
      ? photo.title?.toLowerCase().includes(sQuery) ||
        photo.description?.toLowerCase().includes(sQuery) ||
        photo.location?.toLowerCase().includes(sQuery)
      : true;

    const matchesLocationSelected = locationFilter 
      ? photo.location === locationFilter 
      : true;

    return matchesCategory && matchesSearch && matchesLocationSelected;
  });

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setLocationFilter('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold selection:text-black pb-20 relative overflow-hidden">
      
      {/* Atmosphere Glow Overlays */}
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Immersive Photography Hero Header */}
      <div className="relative bg-[#0A0A0A] border-b border-white/10 overflow-hidden py-24 sm:py-32 px-4 shadow-2xl">
        {/* Background photo behind dark blur layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=40"
            className="w-full h-full object-cover grayscale opacity-15"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-gold/10 border border-gold/30 text-gold text-[10px] font-mono font-bold tracking-[0.25em] uppercase mb-6 animate-pulse">
            <Camera className="w-3.5 h-3.5" />
            FINE ART PHOTOGRAPHY PORTFOLIO
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-white mb-6">
            凍結瞬息、探索光影
          </h1>
          <p className="text-sm max-w-2xl mx-auto text-zinc-400 mb-8 font-sans leading-relaxed">
            這是一個專為攝影愛好者打造的作品展示與管理系統。您可以在此上傳個人的攝影創作、細心歸納分類、標記拍攝細節，並將極致的光影瞬間完美呈現。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#explore" 
              className="bg-gold hover:bg-gold-hover text-black font-bold px-7 py-3 rounded text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-gold/10"
            >
              瀏覽作品展覽
            </a>
            <Link 
              to="/register" 
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-7 py-3 rounded text-[11px] uppercase tracking-widest transition-all"
            >
              加入成為成員
            </Link>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <main id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col gap-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-white tracking-normal border-l-2 border-gold pl-4">
            線上攝影展廊
          </h2>
          {/* Real-time search interface */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            uniqueLocations={uniqueLocations}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              countByCategory={countByCategory}
            />
          </div>

          {/* Photo Collection grid area */}
          <div className="lg:col-span-3">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-gold mb-4" />
                <p className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">載入作品集中...</p>
              </div>
            ) : errorMsg ? (
              <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0A0A0A]">
                <p className="text-red-400 text-sm">{errorMsg}</p>
                <button
                  onClick={fetchPhotos}
                  className="mt-4 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-5 rounded text-xs uppercase tracking-widest border border-white/10 transition-all"
                >
                  重新整理
                </button>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-black/40">
                <div className="w-12 h-12 bg-white/5 text-zinc-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Image className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="text-base font-serif font-bold text-white mb-2">未找到符合條件的作品</h3>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6">
                  精準篩選可能為空。可以嘗試清空搜尋條件或更換分類篩選，來重新展示其他優美瞬間。
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-gold hover:bg-gold-hover text-black font-bold px-6 py-2.5 rounded text-[11px] uppercase tracking-widest transition-all"
                >
                  重設所有篩選條件
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-zinc-500 text-[10.5px] font-mono uppercase tracking-wider">
                    Showing {filteredPhotos.length} of {photos.length} photography works
                  </p>
                  <button 
                    onClick={fetchPhotos}
                    aria-label="Refresh list"
                    className="p-1.5 rounded border border-white/10 text-zinc-400 hover:text-gold hover:border-gold/30 hover:bg-white/5 transition-all duration-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Responsive Bento-ish Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredPhotos.map((photo) => (
                    <div key={photo.id} className="h-full">
                      <PhotoCard 
                        photo={photo} 
                        onDelete={handleDeletePhotoSuccess} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
