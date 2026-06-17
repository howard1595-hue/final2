import React from 'react';
import { Search, MapPin, X, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  locationFilter: string;
  onLocationFilterChange: (val: string) => void;
  uniqueLocations: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  uniqueLocations
}) => {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-4 items-center w-full">
      
      {/* Search Input */}
      <div className="relative w-full md:flex-1">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-zinc-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜尋作品名稱、故事理念或地點關鍵字..."
          className="w-full pl-12 pr-10 py-3 bg-black/40 border border-white/10 text-white rounded-lg placeholder-zinc-600 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-3 flex items-center p-1 hover:text-white text-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location Selector */}
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-zinc-400" />
        </div>
        <select
          value={locationFilter}
          onChange={(e) => onLocationFilterChange(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-black/40 border border-white/10 text-white rounded-lg text-sm appearance-none focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all cursor-pointer"
        >
          <option value="" className="bg-zinc-950 text-white">所有拍攝地點</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc} className="bg-zinc-950 text-white">
              {loc}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
