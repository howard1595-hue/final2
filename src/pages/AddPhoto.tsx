import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { CATEGORIES } from '../types';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  Upload, 
  Loader2, 
  AlertCircle, 
  Check, 
  Link as LinkIcon 
} from 'lucide-react';

export default function AddPhoto() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [shootDate, setShootDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrlInstead, setUseUrlInstead] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUseUrlInstead(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);Alloc:

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUseUrlInstead(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (useUrlInstead) {
      setImagePreview(url || null);
    }
  };

  const toggleUploadMethod = () => {
    const nextState = !useUrlInstead;
    setUseUrlInstead(nextState);
    if (nextState) {
      setImagePreview(imageUrlInput || null);
    } else {
      setImagePreview(imageFile ? URL.createObjectURL(imageFile) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage(null);

    if (!title.trim()) {
      setErrMessage('請輸入作品標題');
      return;
    }

    if (!useUrlInstead && !imageFile) {
      setErrMessage('請上傳您的攝影作品圖片，或是切換使用外部圖片連結。');
      return;
    }

    if (useUrlInstead && !imageUrlInput.trim()) {
      setErrMessage('請輸入有效的作品圖片連結。');
      return;
    }

    setIsLoading(true);

    try {
      await dbService.createPhoto(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          shootDate,
          userId: currentUser?.uid || 'anonymous'
        },
        useUrlInstead ? null : imageFile,
        useUrlInstead ? imageUrlInput.trim() : undefined
      );

      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (e: any) {
      setErrMessage(e.message || '上傳失敗，請稍後重試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 relative overflow-hidden">
      
      {/* Atmosphere Glow Overlays */}
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Top Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-gold text-xs uppercase tracking-widest font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回前頁
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-[#0A0A0A]/80 border border-white/10 rounded-xl p-6 sm:p-10 shadow-2xl">
          
          <div className="border-b border-white/5 pb-6 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-normal">
                發佈全新攝影創作
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1.5">
                填寫以下攝影作品資訊，細部標記時間與創作理念，即可順利將其公開。
              </p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded bg-gold/10 border border-gold/30 items-center justify-center text-gold">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          {errMessage && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-4 rounded text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                作品標題 (PHOTO TITLE) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：藍調淡水、合歡銀河、眼神細語"
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded text-white text-xs focus:outline-none focus:border-gold/80 transition-all font-sans"
                required
              />
            </div>

            {/* Category of Creation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  分類歸屬 (CATEGORY)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/5 text-white rounded text-xs appearance-none focus:outline-none focus:border-gold/80 transition-all cursor-pointer font-sans"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  拍攝地點 (SHOOTING SPOT)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例如：台灣 合歡山、新北市 淡水區"
                    className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/5 rounded text-white text-xs focus:outline-none focus:border-gold/80 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  拍攝日期 (SHOOT DATE)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121212] border border-white/5 rounded text-white text-xs focus:outline-none focus:border-gold/80 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Description / Story content */}
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                作品理念與故事 (CONCEPT & CREDENTIALS)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="寫下您在捕捉此光影當下的故事背景、快門設定或設計構思（例如：慢速快門 10秒、f/8、ISO 100）..."
                rows={4}
                className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded text-white text-xs focus:outline-none focus:border-gold/80 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Image Source Toggle and Upload Form Area */}
            <div className="bg-[#121212]/30 p-5 rounded border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  圖片來源設置 (IMAGE RESOURCE)
                </span>
                
                {/* Method switcher */}
                <button
                  type="button"
                  onClick={toggleUploadMethod}
                  className="flex items-center gap-1 text-[11px] text-gold hover:text-gold-hover font-bold uppercase tracking-wider"
                >
                  {useUrlInstead ? (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      切換到本機檔案上傳
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      切換到外部圖片連結
                    </>
                  )}
                </button>
              </div>

              {useUrlInstead ? (
                /* Paste URL form */
                <div className="space-y-2 animate-in fade-in duration-200">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={handleUrlChange}
                    placeholder="請貼上絕美圖檔的網址（如 Unsplash 圖片網址）..."
                    className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded text-white text-xs focus:outline-none focus:border-gold/80 transition-all font-mono"
                  />
                  <p className="text-zinc-500 text-[10px] leading-normal">
                    建議使用高畫質且穩定的公開圖庫網址 (如 Unsplash、Imgur)，系統將直接加載與展示。
                  </p>
                </div>
              ) : (
                /* File upload container flow */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-gold bg-gold/5'
                        : imageFile
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-white/5 hover:border-white/10 bg-black/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {imageFile ? (
                      <>
                        <div className="w-10 h-10 rounded bg-green-500/10 text-green-400 flex items-center justify-center mb-2">
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-100 max-w-xs truncate">
                          {imageFile.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1">
                          {(imageFile.size / (1024 * 1024)).toFixed(2)} MB • 點選再次變更
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 mb-3">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">點選此處或拖曳圖檔此區來上傳</span>
                        <span className="text-[10px] text-zinc-500 mt-1">支援 PNG, JPG, JPEG, WebP 格式</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Instant Image Preview section */}
              {imagePreview && (
                <div className="mt-5 pt-5 border-t border-white/5 animate-in fade-in duration-300">
                  <span className="text-[10px] font-bold text-zinc-500 block mb-2 font-mono uppercase tracking-widest">
                    圖片即時效果預覽 (PREVIEW)
                  </span>
                  <div className="aspect-[4/3] rounded overflow-hidden bg-black border border-white/5 relative p-1 max-w-sm">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded"
                      onError={() => setErrMessage('預覽圖片無法載入，請確認連結或圖檔是否損毀。')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 font-bold py-2.5 px-6 rounded text-xs uppercase tracking-widest transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-2.5 px-6 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/15 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    發佈處理中
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    發佈作品
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
