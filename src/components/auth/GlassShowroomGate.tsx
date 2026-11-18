import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, Delete, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { useShowroomAuth } from '../../context/ShowroomAuthContext';

export const GlassShowroomGate: React.FC = () => {
  const { unlockShowroom } = useShowroomAuth();
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // تركيز الإدخال تلقائياً
    inputRef.current?.focus();
  }, []);

  // التحقق التلقائي عند إدخال 6 أرقام
  useEffect(() => {
    if (pin.length === 6) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (codeToVerify: string) => {
    if (!codeToVerify || isVerifying) return;
    setIsVerifying(true);
    setErrorMsg(null);

    const success = await unlockShowroom(codeToVerify);
    if (success) {
      setIsSuccess(true);
    } else {
      setShake(true);
      setErrorMsg('رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى');
      setTimeout(() => setShake(false), 600);
      setPin('');
      inputRef.current?.focus();
    }
    setIsVerifying(false);
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(pin);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950 font-sans select-none overflow-hidden" dir="rtl">
      {/* خلفية ديناميكية مع إضاءات زجاجية متوهجة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[160px]"></div>
        {/* شبكة ناعمة للعمق البصري */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      {/* البطاقة الزجاجية المتطورة (Glassmorphism Card) */}
      <div
        className={`relative w-full max-w-md bg-white/[0.06] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8 text-white transition-all duration-300 ${
          shake ? 'animate-shake border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : ''
        } ${isSuccess ? 'scale-95 opacity-0 duration-500' : 'scale-100 opacity-100'}`}
      >
        {/* شارة علوية أمنية */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام محمي ومشفّر</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>معرض حسونة أوتو</span>
          </div>
        </div>

        {/* شعار واسم المعرض */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary blur-md opacity-50"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/20 flex items-center justify-center p-2.5 shadow-inner">
              <img
                src="/logo.svg"
                alt="معرض حسونة أوتو"
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  // بديل في حال تعذر تحميل الشعار
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <KeyRound className="w-7 h-7 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
            معرض حسونة أوتو للسيارات
          </h1>
          <p className="text-xs text-white/60 mt-1">
            أميه ونسة – الوادي، طريق تقرت • هاتف: 0662309669
          </p>
          <p className="text-[11px] text-emerald-400/90 mt-1 font-medium">
            يرجى إدخال رمز الدخول السري لفتح نظام الإدارة
          </p>
        </div>

        {/* نموذج الإدخال السري */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* حقل الإدخال المخفي للوحة المفاتيح الفعلية */}
          <input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length <= 6) {
                setPin(val);
                setErrorMsg(null);
              }
            }}
            className="sr-only"
            autoComplete="off"
            inputMode="numeric"
          />

          {/* دوائر عرض مؤشر الرمز السري (PIN Indicators) */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-black/20 border border-white/10 cursor-pointer hover:border-white/30 transition-colors"
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-gradient-to-tr from-emerald-400 to-teal-200 scale-125 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      : 'bg-white/20 border border-white/30'
                  }`}
                ></div>
              );
            })}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
              className="mr-3 p-1 text-white/40 hover:text-white/80 transition-colors"
              title={showPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* إظهار الأرقام المكتوبة إذا اختار إظهار الرمز */}
          {showPassword && pin && (
            <div className="text-center font-mono tracking-widest text-emerald-300 font-bold text-sm">
              {pin}
            </div>
          )}

          {/* رسالة الخطأ */}
          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* لوحة أزرار الأرقام التفاعلية للمس والهاتف والحاسوب */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] active:bg-white/[0.22] active:scale-95 border border-white/10 font-latin font-bold text-lg text-white transition-all flex items-center justify-center shadow-xs"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 border border-white/10 text-xs text-white/60 font-semibold transition-all flex items-center justify-center"
            >
              مسح
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] active:bg-white/[0.22] active:scale-95 border border-white/10 font-latin font-bold text-lg text-white transition-all flex items-center justify-center shadow-xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 border border-white/10 text-white/70 transition-all flex items-center justify-center"
              title="مسح رقم"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* زر التأكيد اليدوي */}
          <button
            type="submit"
            disabled={pin.length === 0 || isVerifying}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white text-xs transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>جاري التحقق والتشفير...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>فتح لوحة تحكم المعرض</span>
              </>
            )}
          </button>
        </form>

        {/* تذييل البطاقة */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-white/40">
          <span>نظام التسيير الداخلي لمعرض حسونة أوتو • خاضع لحماية التشفير القياسي</span>
        </div>
      </div>
    </div>
  );
};

