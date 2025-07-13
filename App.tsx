import React, { useState, useEffect, useCallback } from 'react';

// ---- URL Backend Google Apps Script ----
// URL ứng dụng web đã được tích hợp sẵn.
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw98atO4DVVxrEUvvcgNrao_j0jSqCBRk-179yAwmdm8mlJIBSdvXc08BTxJWEtZWlUdA/exec';

// ---- Biểu tượng (Icons) ----
const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11H11V3H3V11ZM5 5H9V9H5V5Z" /><path d="M3 21H11V13H3V21ZM5 15H9V19H5V15Z" /><path d="M13 3H21V11H13V3ZM15 5H19V9H15V5Z" /><path d="M19 19H21V21H19V19Z" /><path d="M13 13H15V15H13V13Z" /><path d="M15 15H17V17H15V15Z" /><path d="M13 17H15V19H13V17Z" /><path d="M17 17H19V19H17V17Z" /><path d="M19 17H21V19H19V17Z" /><path d="M17 13H19V15H17V13Z" /><path d="M19 13H21V15H19V13Z" /><path d="M19 15H21V17H19V15Z" /></svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.586l-4.293-4.293-1.414 1.414L12 18.414l5.707-5.707-1.414-1.414L12 15.586z" /><path d="M12 4v11h2V4z" transform="rotate(180 13 9.5)" /><path d="M5 20h14a1 1 0 000-2H5a1 1 0 000 2z" /></svg>
);
const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zm0-7c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1V3c0-.55.45-1 1-1zm0 18c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-.55.45-1 1-1zm-8-8c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1zm18 0c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1zM5.64 5.64c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41L5.64 8.46c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41L5.64 5.64zm12.72 12.72c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-1.41 1.41c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41l1.41-1.41zM5.64 18.36c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.41-1.41c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-1.41 1.41zm12.72-12.72c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.41-1.41c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-1.41 1.41z"/></svg>
);
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.64-.11 2.41-.31-1.13-.9-1.92-2.18-2.26-3.6C11.48 16.54 11 15.32 11 14c0-2.21 1.79-4 4-4 .32 0 .63.04.94.11-.4-1.29-.98-2.45-1.72-3.45C13.53 4.86 12.16 4 10.5 4c-.17 0-.33.02-.5.04C10.58 3.39 11.27 3 12 3z" /></svg>
);

// ---- Hook tùy chỉnh ----
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// ---- Thành phần hiển thị QR Code ----
interface QRCodeDisplayProps {
  qrCodeUrl: string;
  isLoading: boolean;
  inputText: string;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeUrl, isLoading, inputText, setIsLoading, setError }) => {
  const getFilename = () => {
    try {
        const url = new URL(inputText);
        return `${url.hostname.replace(/^www\./, '')}-qrcode.png`;
    } catch (_) {
        const safeText = inputText.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        return `${safeText || 'qrcode'}.png`;
    }
  };

  const handleDownload = async () => {
    if (!inputText) return;
    const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(inputText)}`;
    try {
        const response = await fetch(googleChartsUrl);
        if (!response.ok) throw new Error('Không thể tải hình ảnh từ API.');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = getFilename();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
        console.error("Lỗi tải xuống:", err);
        setError("Không thể tải xuống mã QR. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mt-6 transition-all duration-300 ease-in-out">
      {isLoading ? (
        <div className="w-full h-80 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
          <LoaderIcon className="w-12 h-12 text-indigo-500" />
        </div>
      ) : qrCodeUrl ? (
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <img 
              src={qrCodeUrl} 
              alt="Generated QR Code" 
              className="w-72 h-72 rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Không thể tải hình ảnh mã QR từ backend. Hãy kiểm tra lại URL.');
                setIsLoading(false);
              }}
            />
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
            Tải xuống PNG
          </button>
        </div>
      ) : (
        <div className="w-full h-80 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
          <QrCodeIcon className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-500" />
          <p className="font-semibold">Mã QR của bạn sẽ xuất hiện ở đây</p>
          <p className="text-sm">Nhập văn bản để bắt đầu</p>
        </div>
      )}
    </div>
  );
};

// ---- Thành phần ứng dụng chính ----
function App() {
  const [inputText, setInputText] = useState<string>('https://www.google.com/search?q=gemini-2.5-flash');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const debouncedInputText = useDebounce(inputText, 500);

  // Khởi tạo và quản lý Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);
  
  // Áp dụng theme khi state thay đổi
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const logQRCodeGeneration = useCallback((generatedText: string) => {
    if (!GAS_WEB_APP_URL) return; 
    const logData = { timestamp: new Date().toISOString(), text: generatedText };
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(logData)], { type: 'text/plain;charset=utf-8' });
      navigator.sendBeacon(GAS_WEB_APP_URL, blob);
    } else {
      fetch(GAS_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', body: JSON.stringify(logData),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      }).catch(error => console.error('Không thể gửi dữ liệu nhật ký:', error));
    }
  }, []);

  const generateQRCode = useCallback((text: string) => {
    if (!GAS_WEB_APP_URL) {
      setError("URL Google Apps Script chưa được cấu hình trong mã nguồn.");
      setIsLoading(false);
      return;
    }
    if (!text.trim()) {
      setQrCodeUrl('');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const backendUrl = `${GAS_WEB_APP_URL}?text=${encodeURIComponent(text)}`;
    setQrCodeUrl(backendUrl);
  }, []);
  
  useEffect(() => {
    if (debouncedInputText && GAS_WEB_APP_URL) {
      generateQRCode(debouncedInputText);
      logQRCodeGeneration(debouncedInputText);
    } else if (!debouncedInputText) {
      setQrCodeUrl('');
      setError(null);
      setIsLoading(false);
    }
  }, [debouncedInputText, generateQRCode, logQRCodeGeneration]);

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <header className="relative text-center mb-6">
              <div className="absolute top-0 right-0 flex items-center">
                <button onClick={toggleTheme} className="text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                  {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
              </div>
              <div className="inline-flex items-center gap-3">
                  <QrCodeIcon className="w-8 h-8 text-indigo-500" />
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Trình tạo QR Pro</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Mã QR được tạo tự động khi bạn gõ.</p>
            </header>
            
            <main>
              <div className="flex flex-col gap-4">
                <label htmlFor="qr-input" className="sr-only">Nhập URL hoặc văn bản</label>
                <input
                  id="qr-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="ví dụ: https://example.com"
                  className="w-full px-4 py-3 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none focus:ring-0 transition"
                  required
                />
              </div>

              {error && ( <p className="text-red-500 text-sm mt-4 text-center">{error}</p> )}

              <QRCodeDisplay qrCodeUrl={qrCodeUrl} isLoading={isLoading} inputText={debouncedInputText} setIsLoading={setIsLoading} setError={setError} />
            </main>
          </div>
          <footer className="text-center mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">Phát triển bởi React & Tailwind CSS.</p>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
