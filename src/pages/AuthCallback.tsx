import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Corrected path to supabaseClient

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 當頁面載入時，自動完成登入 Session 交換
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("登入失敗", error);
        navigate('/login'); // 失敗導回登入頁
      } else {
        // 成功獲取 Session 後
        if (window.opener) {
          try {
            // 傳送登入成功 Hash 訊息給父視窗，讓父視窗能立即設定 Session 與顯示 Toast
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              hash: window.location.hash,
              search: window.location.search
            }, window.location.origin);
          } catch (e) {
            console.error("傳送訊息給父視窗時發生錯誤:", e);
          }
          // 關閉彈出視窗
          window.close();
        } else {
          // 非彈出視窗，直接導向回首頁
          navigate('/');
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zen-cream">
      <h2 className="text-2xl">帳號驗證中...</h2>
    </div>
  );
};
