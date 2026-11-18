import React, { createContext, useContext, useState, useEffect } from 'react';

// التجزئة المشفرة SHA-256 لكلمة سر المعرض (لا تحتوي على الرمز الصريح نهائياً)
const SHOWROOM_AUTH_HASH = 'd3bbb6153cf36d4da3fb6b974ed23fce77cbfefdbd3f965b7d7dbb96a975fa08';
const AUTH_STORAGE_KEY = 'hassouna_auto_auth_session';

interface ShowroomAuthContextType {
  isUnlocked: boolean;
  unlockShowroom: (password: string) => Promise<boolean>;
  lockShowroom: () => void;
}

const ShowroomAuthContext = createContext<ShowroomAuthContextType | undefined>(undefined);

// دالة تجزئة كلمة السر باستخدام Web Cryptography API الأصلية في المتصفح
async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const ShowroomAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // استرجاع حالة الجلسة المحفوظة
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // جلسة صالحة لمدة 24 ساعة
        if (parsed?.token === SHOWROOM_AUTH_HASH && parsed?.expires > Date.now()) {
          return true;
        }
      }
    } catch {
      // في حال وجود خطأ في قراءة التخزين
    }
    return false;
  });

  const unlockShowroom = async (password: string): Promise<boolean> => {
    try {
      const hashedInput = await hashPassword(password);
      if (hashedInput === SHOWROOM_AUTH_HASH) {
        setIsUnlocked(true);
        const sessionData = {
          token: SHOWROOM_AUTH_HASH,
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 ساعة
        };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        return true;
      }
    } catch (err) {
      console.error('Error verifying showroom password:', err);
    }
    return false;
  };

  const lockShowroom = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <ShowroomAuthContext.Provider value={{ isUnlocked, unlockShowroom, lockShowroom }}>
      {children}
    </ShowroomAuthContext.Provider>
  );
};

export const useShowroomAuth = (): ShowroomAuthContextType => {
  const context = useContext(ShowroomAuthContext);
  if (!context) {
    throw new Error('useShowroomAuth must be used within a ShowroomAuthProvider');
  }
  return context;
};

