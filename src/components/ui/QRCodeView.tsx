import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 96,
  className = '',
  label,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="bg-slate-100 rounded" />;
  }

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src={dataUrl}
        alt="QR Code Verification"
        style={{ width: size, height: size }}
        className="rounded border border-slate-300 shadow-2xs"
      />
      {label && (
        <span className="text-[10px] text-text-muted mt-1 font-latin text-center">
          {label}
        </span>
      )}
    </div>
  );
};
