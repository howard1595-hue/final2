import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import PhotoCard from '../components/PhotoCard';
import { dbService } from '../services/firebase';
import { Photo } from '../types';
import { Image, RefreshCw, Layers } from 'lucide-react';

export default function Gallery() {
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
      setErrorMsg('無法載入作品，請重試。');
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
      throw new Error(e.message || '刪除失敗');
    }
  };

  const uniqueLocations: string[] = Array.from(
    new Set(
      photos
        .map((p) => p.location?.trim() || '')
        .filter((loc) => loc !== '')
    )
  ).sort() as string[];

  const countByCategory: Record<string, number> = {};
  photos.forEach((p) => {
    if (p.category) {
      countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
    }
  });

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = selectedCategory ? photo.category === selectedCategory : true;
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

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 relative overflow-hidden">
      
      {/* Atmosphere Glow Overlays */}
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-[-150px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Decorative Title Banner */}
      <div className="bg-[#0A0A0A]/80 border-b border-white/10 py-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-normal flex items-center justify-center md:justify-start gap-2.5">
              <Layers className="w-5 h-5 text-gold" />
              探索攝影作品展示廊
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              由光影編織的精緻快門作品集，與每一刻值得珍藏的攝影日記。
            </p>
          </div>
          <div className="text-zinc-400 text-[11px] font-mono uppercase tracking-wider bg-black/40 px-3 py-1.5 rounded border border-white/10 shadow-inner">
            TOTAL {photos.length} PHOTOGRAPHY COLLECTIONS
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        
        {/* Real-time search filter row */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          uniqueLocations={uniqueLocations}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
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
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-gold mb-4" />
                <p className="text-[10.5px] font-mono tracking-widest uppercase text-zinc-500">載入作品集中...</p>
              </div>
            ) : errorMsg ? (
              <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#0A0A0A]">
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-black/40">
                <div className="w-12 h-12 bg-white/5 text-zinc-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Image className="w-5 h-5 text-zinc-450" />
                </div>
                <h3 className="text-base font-serif font-bold text-white mb-2">未找到符合條件的作品</h3>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-6">
                  精準篩選可能為空。可以嘗試清空搜尋條件或更換篩選。
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-zinc-500 text-[10.5px] font-mono uppercase tracking-wider flex items-center justify-between">
                  <span>Showing {filteredPhotos.length} of {photos.length} works</span>
                  <button onClick={fetchPhotos} className="p-1 hover:text-gold text-zinc-500 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredPhotos.map((photo) => (
                    <PhotoCard 
                      key={photo.id} 
                      photo={photo} 
                      onDelete={handleDeletePhotoSuccess} 
                    />
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
