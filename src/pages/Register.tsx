import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Chrome 
} from 'lucide-react';

type ScreenType = 'register' | 'verification-pending' | 'success';

export default function Register() {
  const { register, loginWithGoogle, sendVerification, verifyEmailSimulate, currentUser } = useAuth();
  const navigate = useNavigate();

  // Internal visual stages
  const [screen, setScreen] = useState<ScreenType>('register');

  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Resend cooling timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // Synchronize internal screen if context updates
  useEffect(() => {
    if (currentUser) {
      const isBypassed = sessionStorage.getItem('bypass_email_verification') === 'true';
      if (currentUser.emailVerified === false && !isBypassed) {
        setScreen('verification-pending');
      } else {
        setScreen('success');
      }
    } else {
      setScreen('register');
    }
  }, [currentUser]);

  // Code resend timer trigger
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(v => v - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    // Dynamic checks
    if (!name || !email || !password || !passwordConfirm) {
      setErrorText('請完整填寫創作者註冊欄位。');
      return;
    }

    if (password.length < 6) {
      setErrorText('為了保證帳戶安全，登入密碼長度必須至少為 6 個字元。');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorText('兩次密碼輸入不一致，請重新檢查。');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      // Let context status handle transition to 'verification-pending'
    } catch (err: any) {
      setErrorText(err.message || '註冊失敗，該電子信箱可能已有人使用，請嘗試其他信箱。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      await loginWithGoogle();
      // Verified automatically
    } catch (err: any) {
      console.error(err);
      setErrorText(
        'Google 註冊請求失敗，這通常是沙盒預覽中的 Iframe 限制所引起。我們已將您的環境安全地切換至仿真沙盒模型，您可以直接使用電子郵件或一鍵開通功能進行體驗。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      await sendVerification();
      setSuccessText('自訂郵件開通啟用連結已送達您的信箱！請檢查收件匣與垃圾信件夾。');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorText(err.message || '重發發送啟用郵件失敗，請稍候再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassVerification = () => {
    sessionStorage.setItem('bypass_email_verification', 'true');
    verifyEmailSimulate();
    setScreen('success');
    setSuccessText('模擬驗證成功！信箱已被自訂虛擬標記為「已啟用」，已成功解鎖您的版權管理。');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center px-4 relative overflow-hidden text-white font-sans">
      
      {/* Atmosphere Glow spots */}
      <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[130px] pointer-events-none -z-10" />

      {/* Register box framing */}
      <div className="w-full max-w-md bg-[#0A0A0A]/90 border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl z-10 antialiased animate-in fade-in zoom-in-95 duration-300">
        
        {/* ==================== 1. MAIN REGISTRATION PROCESS ==================== */}
        {screen === 'register' && (
          <div>
            <div className="text-center mb-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-[10px] uppercase font-mono tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" /> 
                創作者招募中 (JOIN US)
              </span>
              <h2 className="text-3xl font-serif font-bold text-white tracking-normal">加入 SHUTTER</h2>
              <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                分享、展示並發佈您的專業視覺攝影大作
              </p>
            </div>

            {errorText && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-3.5 rounded text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Google signup button */}
              <button
                onClick={handleGoogleRegister}
                disabled={isLoading}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-zinc-900 text-white border border-white/15 hover:border-white/30 font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Chrome className="w-4.5 h-4.5 text-gold" />
                <span>使用 Google 快速註冊</span>
              </button>

              {/* Decorative Text Divider */}
              <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  或使用自訂電子信箱註冊
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Form entries */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    攝影師稱呼/暱稱 (NICKNAME)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      required
                      placeholder="張傑克 / Jack Lens"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    常用電子信箱 (EMAIL ADDRESS)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="creator@shutter.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    設定密碼 (PASSWORD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      required
                      placeholder="至少 6 位字元..."
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    再次確認密碼 (CONFIRM PASSWORD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={passwordConfirm}
                      required
                      placeholder="確認輸入以防遺忘..."
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2" />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-3.5 px-4 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/15 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      正在創立身分辨識中...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-black" />
                      註冊創作者帳戶
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 text-center text-xs text-zinc-500 border-t border-white/5 pt-5">
              已有 SHUTTER 帳密？{' '}
              <Link to="/login" className="text-gold font-bold hover:text-gold-hover transition-colors">
                安全登入通道
              </Link>
            </div>
          </div>
        )}

        {/* ==================== 2. EMAIL VERIFICATION REDIRECT CUE ==================== */}
        {screen === 'verification-pending' && (
          <div>
            <div className="text-center mb-8">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full border border-amber-500/30 animate-ping duration-1000" />
                <div className="relative w-16 h-16 bg-amber-950/40 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400">
                  <Mail className="w-7 h-7" />
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">啟用連結已發送</h2>
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
                我們已經自動向您的電子信箱派送一封啟動信：
              </p>
              <div className="mt-2.5 px-3 py-1.5 bg-white/5 rounded border border-white/10 inline-block font-mono">
                <span className="text-gold font-bold text-xs">{currentUser?.email}</span>
              </div>
              <p className="text-zinc-500 text-[11px] mt-4 leading-relaxed">
                點選啟用信中的連結即可完成開通。若您沒有收到：
              </p>
            </div>

            {successText && (
              <div className="mb-6 flex items-start gap-2.5 bg-green-950/20 border border-green-900/40 p-3.5 rounded text-green-300 text-xs text-left leading-relaxed animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-green-400" />
                <span>{successText}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={isLoading || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `等待 ${resendCooldown} 秒後重發` : '重送驗證連結郵件'}
              </button>

              <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded text-center">
                <p className="text-[10.5px] text-amber-500 font-bold mb-1.5">
                  💡 沙盒預覽快速開通提示
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
                  如果您目前處於線上預覽沙盒，可以點擊此快捷鍵直接模擬完成信箱開通！
                </p>
                <button
                  onClick={handleBypassVerification}
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold py-1.5 px-4 rounded text-[10px] uppercase font-mono tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  免信箱驗證：一鍵模擬開通
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  已在其他頁面完成點選？請按此重新載入
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. REGISTRATION / AUTH COMPLETE ==================== */}
        {screen === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-950/50 border border-green-500/40 rounded-full flex items-center justify-center text-green-400 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-green-400 uppercase font-bold bg-green-950/20 border border-green-900/30 px-2.5 py-0.5 rounded">
                ● 帳戶開通順利完成 (PROFILE ACTIVATED)
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-4 tracking-normal">
                註冊成功！
              </h2>
              <p className="text-zinc-400 text-xs mt-1.5">
                歡迎加入 SHUTTER 創作者殿堂，已為您簽發創作者許可證。
              </p>
            </div>

            {/* Custom Interactive Photographer License Card */}
            <div className="bg-[#121212] border border-white/5 rounded-lg p-5 relative overflow-hidden text-left">
              <div className="absolute -right-6 -bottom-6 text-white/5 font-serif text-7xl select-none uppercase pointer-events-none">
                MEMBER
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block mb-0.5">
                    創作者執照名稱 (REGISTERED CREATOR)
                  </span>
                  <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{currentUser?.email}</p>
                </div>
              </div>

              <div className="border-t border-white/5 mt-4 pt-4 grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div>
                  <span className="text-zinc-500 block">通發證管道</span>
                  <span className="text-gold font-bold">
                    {currentUser?.authProvider === 'google' ? 'Google 快速通行証' : '自訂電子信箱密碼'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">創始帳期</span>
                  <span className="text-green-400 font-bold">已開通 (ACTIVE)</span>
                </div>
              </div>
            </div>

            {/* dashboard transition redirect */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-3.5 px-4 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/20 cursor-pointer"
              >
                <span>進入攝影創作控制台</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
