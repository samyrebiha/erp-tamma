import React, { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShowroomAuth } from '../../context/ShowroomAuthContext';

export const GlassShowroomGate: React.FC = () => {
  const { unlockShowroom } = useShowroomAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await unlockShowroom(password, rememberMe);
    if (!success) {
      setShake(true);
      setErrorMsg('كلمة السر غير صحيحة، يرجى إعادة المحاولة');
      setTimeout(() => setShake(false), 500);
      setPassword('');
      inputRef.current?.focus();
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950 font-sans select-none overflow-hidden"
      dir="rtl"
    >
      {/* خلفية جمالية خافتة بتدرج لوني ناعم */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px]"></div>
      </div>

      {/* البطاقة الزجاجية البسيطة والأنيقة */}
      <div
        className={`relative w-full max-w-sm bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-7 text-white transition-all duration-200 ${
          shake ? 'animate-shake border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.25)]' : ''
        }`}
      >
        {/* الترويسة والشعار */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2.5 shadow-inner mb-3">
            <img
              src="/logo.svg"
              alt="معرض حسونة أوتو"
              className="w-full h-full object-contain filter drop-shadow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>

          <h1 className="text-lg font-bold text-white tracking-tight">معرض حسونة أوتو</h1>
          <p className="text-xs text-white/60 mt-0.5">أميه ونسة – الوادي • هاتف: 0662309669</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              كلمة سر المعرض:
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="أدخل كلمة السر..."
                dir="ltr"
                className="w-full h-11 px-3.5 pr-3.5 pl-10 rounded-xl bg-black/25 border border-white/15 text-white placeholder:text-white/30 text-sm font-mono tracking-widest focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-center"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-white/40 hover:text-white/80 transition-colors"
                title={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* خيار تذكرني */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-black/30 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>

            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>مشفّر</span>
            </span>
          </div>

          {/* رسالة الخطأ إن وجدت */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 p-2 rounded-lg animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full h-11 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <span>دخول إلى لوحة التحكم</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3.5 border-t border-white/10 text-center text-[10px] text-white/40">
          نظام التسيير الداخلي • معرض حسونة أوتو
        </div>
      </div>
    </div>
  );
};
