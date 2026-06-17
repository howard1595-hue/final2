import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  User, 
  Chrome 
} from 'lucide-react';

type ScreenType = 'login' | 'forgot-password' | 'verification-pending' | 'success';

export default function Login() {
  const { login, loginWithGoogle, sendPasswordReset, sendVerification, verifyEmailSimulate, logout, currentUser, isEmulator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Internal visual stages
  const [screen, setScreen] = useState<ScreenType>('login');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  
  // Resend cool-down logic
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirection target path
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Watch for current user verification status to adjust view state
  useEffect(() => {
    if (currentUser) {
      const isBypassed = sessionStorage.getItem('bypass_email_verification') === 'true';
      if (currentUser.emailVerified === false && !isBypassed) {
        setScreen('verification-pending');
      } else {
        setScreen('success');
      }
    } else {
      setScreen('login');
    }
  }, [currentUser]);

  // Code resend timer trigger
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(v => v - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText('請完整填寫電子信箱與密碼欄位。');
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const user = await login(email, password);
      // Hook will update screen dynamically based on emailVerified status
    } catch (err: any) {
      setErrorText(err.message || '登入失敗，請檢查您的帳號與密碼，或是稍後再重試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      await loginWithGoogle();
      // Google accounts are pre-verified, will automatically flip to 'success' screen
    } catch (err: any) {
      console.error(err);
      // Iframe constraint backup handling
      setErrorText(
        'Google 驗證請求失敗，這通常是沙盒預覽中的 Iframe 限制所引起。我們已將您的環境安全地切換至仿真沙盒模型，您可以直接利用電子信箱或一鍵測試功能進行體驗。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorText('請輸入要重設密碼的電子信箱。');
      return;
    }

    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      await sendPasswordReset(resetEmail);
      setSuccessText(`密碼重設連接已寄出！請至 ${resetEmail} 收取信件重設您的登入密碼。`);
      setResetEmail('');
    } catch (err: any) {
      setErrorText(err.message || '無法發送重設信件，請確認該電子信箱是否已註冊。');
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
      setSuccessText('新的帳戶啟用認證連結已成功寄出！請至收件匣與垃圾郵件區檢查。');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorText(err.message || '無法重送驗證信件，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassVerification = () => {
    sessionStorage.setItem('bypass_email_verification', 'true');
    verifyEmailSimulate();
    setScreen('success');
    setSuccessText('模擬驗證成功！信箱已被虛擬標記為「已啟用」，已成功解鎖您的權限。');
  };

  const handleFillDemo = () => {
    setEmail('demo@example.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center px-4 relative overflow-hidden text-white font-sans">
      
      {/* Decorative Atmosphere Glow Spots */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[130px] pointer-events-none -z-10" />

      {/* Main Authentication card */}
      <div className="w-full max-w-md bg-[#0A0A0A]/90 border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl z-10 antialiased animate-in fade-in zoom-in-95 duration-300">
        
        {/* ==================== 1. MAIN LOGIN SCREEN ==================== */}
        {screen === 'login' && (
          <div>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-[10px] uppercase font-mono tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> 
                創作者安全通道 (SECURE PORTAL)
              </span>
              <h2 className="text-3xl font-serif font-bold text-white tracking-wide">SHUTTER 登入</h2>
              <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                高階美學攝影作品發佈系統管理控制中心
              </p>
            </div>

            {errorText && (
              <div className="mb-6 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-3.5 rounded text-red-400 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                <span className="leading-relaxed">{errorText}</span>
              </div>
            )}

            {successText && (
              <div className="mb-6 flex items-start gap-2.5 bg-green-950/20 border border-green-900/40 p-3.5 rounded text-green-400 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
                <span className="leading-relaxed">{successText}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Google OAuth Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-[#111] hover:bg-zinc-900 text-white border border-white/15 hover:border-white/30 font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-50"
              >
                <Chrome className="w-4.5 h-4.5 text-gold" />
                <span>使用 Google 快速登入</span>
              </button>

              {/* Decorative Text Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  或使用電子信箱認證
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Standard Email Auth Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    電子郵件 (EMAIL ADDRESS)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@shutter.com"
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                    創作者密碼 (PASSWORD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/15 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      驗證數位憑證中...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-black" />
                      安全登入系統
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Helper Navigation links */}
            <div className="mt-8 flex items-center justify-between text-xs text-zinc-500 font-sans border-t border-white/5 pt-6">
              <button
                onClick={() => {
                  setErrorText(null);
                  setSuccessText(null);
                  setScreen('forgot-password');
                }}
                className="hover:text-gold transition-colors font-bold outline-none"
              >
                忘記密碼？
              </button>
              <div className="text-zinc-700">|</div>
              <div>
                還沒加入？{' '}
                <Link to="/register" className="text-gold font-bold hover:text-gold-hover transition-colors">
                  快速註冊帳號
                </Link>
              </div>
            </div>

            {/* Local Emulator demo accounts helper assistance */}
            <div className="mt-8 border-t border-dashed border-white/5 pt-6 text-center font-sans">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[9px] border border-white/5 text-zinc-400">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>開發者沙盒快速輔助機制</span>
              </div>
              <button
                onClick={handleFillDemo}
                className="mt-3 block mx-auto text-[10px] text-gold hover:text-gold-hover font-mono font-bold bg-[#111] hover:bg-white/5 border border-white/10 px-3.5 py-1.5 rounded transition-all uppercase tracking-wider"
              >
                一鍵填寫 Demo 帳密
              </button>
            </div>
          </div>
        )}

        {/* ==================== 2. FORGOT PASSWORD MODAL ==================== */}
        {screen === 'forgot-password' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold mx-auto mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">重設創作者密碼</h2>
              <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                系統將發送一封帳戶密碼還原郵件，請輸入您當初註冊的信箱。
              </p>
            </div>

            {errorText && (
              <div className="mb-6 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-3.5 rounded text-red-400 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            {successText && (
              <div className="mb-6 flex items-start gap-2.5 bg-green-950/20 border border-green-900/40 p-3.5 rounded text-green-400 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successText}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
                  認證註冊信箱 (REGISTERED EMAIL)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={resetEmail}
                    required
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="請輸入註冊的信箱郵件..."
                    className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/5 focus:border-gold/50 rounded text-white text-xs focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/15 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    發送安全代碼中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-black" />
                    發送重設密碼連結
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-5">
              <button
                onClick={() => {
                  setErrorText(null);
                  setSuccessText(null);
                  setScreen('login');
                }}
                className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
              >
                返回安全登入入口
              </button>
            </div>
          </div>
        )}

        {/* ==================== 3. EMAIL VERIFICATION PENDING ==================== */}
        {screen === 'verification-pending' && (
          <div>
            <div className="text-center mb-8">
              {/* Mail alert animation glow */}
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full border border-amber-500/30 animate-ping duration-1000" />
                <div className="relative w-16 h-16 bg-amber-950/40 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">需要啟動或驗證電子信箱</h2>
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
                我們已發送一封帳戶開通啟用信至此電子信箱：
              </p>
              <div className="mt-2.5 px-3 py-1.5 bg-white/5 rounded border border-white/10 inline-block">
                <span className="text-gold font-mono text-xs font-bold">{currentUser?.email}</span>
              </div>
              <p className="text-zinc-500 text-[11px] mt-3 leading-relaxed">
                請至收件匣（含垃圾郵件分類）尋找驗證連結並點擊，即可成功開通專屬攝影師後台。
              </p>
            </div>

            {errorText && (
              <div className="mb-6 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-3 rounded text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}

            {successText && (
              <div className="mb-6 flex items-start gap-2.5 bg-green-950/25 border border-green-900/40 p-3.5 rounded text-green-300 text-xs">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
                <span className="leading-relaxed">{successText}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Resend button */}
              <button
                onClick={handleResendVerification}
                disabled={isLoading || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `請稍等 ${resendCooldown} 秒後重送` : '重新寄發驗證信件'}
              </button>

              {/* Instant emulator simulation bypass helper */}
              <div className="bg-amber-950/15 border border-amber-500/20 p-4 rounded text-center">
                <p className="text-[10.5px] text-amber-500 font-bold mb-2">
                  💡 沙盒預覽快速開通提示
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
                  若本機郵件代理或 Firebase 網域尚未指派，可在此點按模擬認證，一秒免收發信即刻解鎖完整權利！
                </p>
                <button
                  onClick={handleBypassVerification}
                  type="button"
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold py-1.5 px-4 rounded text-[10px] uppercase font-mono tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  免信箱驗證：一鍵開通功能
                </button>
              </div>

              {/* Return to log out */}
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full text-zinc-500 hover:text-zinc-300 transition-colors text-xs py-2 text-center"
              >
                已在新視窗完成了驗證？點選此重新整理登入
              </button>
            </div>
          </div>
        )}

        {/* ==================== 4. AUTHTENTICATE SUCCESS BANNER & INFO CARD ==================== */}
        {screen === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              {/* Spinning or glowing ring for verified accounts */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-green-500/10 rounded-full border border-green-500/30 animate-pulse" />
                <div className="relative w-16 h-16 bg-green-950/50 border border-green-500/40 rounded-full flex items-center justify-center text-green-400">
                  <Check className="w-8 h-8" />
                </div>
              </div>

              <span className="text-[10px] font-mono tracking-widest text-green-400 uppercase font-bold bg-green-950/20 border border-green-900/30 px-2.5 py-0.5 rounded">
                ● 帳戶身分已完成開通驗證 (VERIFIED COMPLETE)
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-4 tracking-normal">
                登入成功
              </h2>
              <p className="text-zinc-400 text-xs mt-1.5">
                憑證認證成功，正在为您簽發 SHUTTER 控制台特權通行證...
              </p>
            </div>

            {/* Custom Interactive Photographer Card layout */}
            <div className="bg-[#121212] border border-white/5 rounded-lg p-5 relative overflow-hidden">
              {/* Background ambient watermarks */}
              <div className="absolute -right-6 -bottom-6 text-white/5 font-serif text-7xl select-none uppercase pointer-events-none">
                PASS
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block mb-0.5">
                    創作者執照姓名 (CREATOR EXCLUSIVE PROFILE)
                  </span>
                  <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{currentUser?.email}</p>
                </div>
              </div>

              <div className="border-t border-white/5 mt-4 pt-4 grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div>
                  <span className="text-zinc-500 block">通驗證管道</span>
                  <span className="text-gold font-bold">
                    {currentUser?.authProvider === 'google' ? 'Google OAuth 認證位' : '雙重安全信箱密碼'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">帳戶啟用狀態</span>
                  <span className="text-green-400 font-bold">已開通 (ACTIVE)</span>
                </div>
              </div>
            </div>

            {/* Buttons and redirection cues */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(from, { replace: true })}
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-black font-bold py-3.5 px-4 rounded text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold/20 cursor-pointer"
              >
                <span>進入攝影創作控制台</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={async () => {
                  try {
                    await logout();
                    window.location.reload();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full text-zinc-500 hover:text-zinc-300 text-xs text-center font-bold uppercase tracking-wider py-1.5 transition-colors"
              >
                切換或使用其他帳號登入
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
