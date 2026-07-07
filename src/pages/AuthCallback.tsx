import React, { useEffect } from 'react';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Send OAuth hash parameters back to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'OAUTH_AUTH_SUCCESS',
        hash: window.location.hash,
        search: window.location.search
      }, '*');
      window.close();
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zen-cream text-zen-wood px-6 text-center">
      <div className="w-12 h-12 border-4 border-zen-green border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-2xl font-serif italic mb-2">帳號驗證中...</h2>
      <p className="text-stone-500 text-sm">正在將您安全地引導回覓野茶官網，請勿關閉此視窗。</p>
    </div>
  );
};
