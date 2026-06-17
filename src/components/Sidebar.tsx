import React from 'react';
import { LayoutGrid, Mountain, User, MapPin, Moon, Leaf } from 'lucide-react';
import { CategoryType, CATEGORIES } from '../types';

interface SidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  countByCategory?: Record<string, number>;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onSelectCategory, countByCategory = {} }) => {
  const categoriesList = [
    { name: '全部作品', value: null, icon: LayoutGrid },
    { name: '風景攝影', value: '風景攝影', icon: Mountain },
    { name: '人像攝影', value: '人像攝影', icon: User },
    { name: '街拍攝影', value: '街拍攝影', icon: MapPin },
    { name: '夜景攝影', value: '夜景攝影', icon: Moon },
    { name: '生態攝影', value: '生態攝影', icon: Leaf },
  ];

  const totalPhotos = Object.values(countByCategory).reduce((acc: number, curr: number) => acc + curr, 0);

  return (
    <aside className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 lg:sticky lg:top-28">
      <div className="mb-6 pb-4 border-b border-white/10">
        <h2 className="text-lg font-serif font-bold tracking-tight text-white">
          分類篩選
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-semibold">
          FILTER BY COLLECTION
        </p>
      </div>

      <div className="flex flex-row overflow-x-auto gap-2 pb-3 lg:pb-0 lg:flex-col lg:overflow-x-visible lg:gap-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {categoriesList.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.value;
          const count = item.value === null ? totalPhotos : (countByCategory[item.value] || 0);

          return (
            <button
              key={item.name}
              onClick={() => onSelectCategory(item.value)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap lg:w-full group border-l-2 ${
                isSelected
                  ? 'bg-white/5 border-gold text-white shadow-xl'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-gold' : 'text-zinc-500 group-hover:text-gold'
                }`} />
                <span>{item.name}</span>
              </div>
              
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${
                isSelected 
                  ? 'bg-gold/15 text-gold border-gold/30' 
                  : 'bg-white/5 text-zinc-500 border-white/5 group-hover:bg-white/10 group-hover:text-zinc-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
