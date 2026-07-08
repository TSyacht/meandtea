import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Corrected path to supabaseClient

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 當頁面載入時，自動完成登入 Session 交換
    const handleCallback = async () => {
      // 優先從 hash 解析 token
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      let sessionSuccess = false;

      if (access_token && refresh_token) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error && data.session) {
            sessionSuccess = true;
          }
        } catch (e) {
          console.error("手動 setSession 失敗:", e);
        }
      }

      // 如果手動沒解析到，再用 getSession 確保一次
      if (!sessionSuccess) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (data.session && !error) {
            sessionSuccess = true;
          }
        } catch (e) {
          console.error("getSession 失敗:", e);
        }
      }

      // 1. 跨視窗通訊通知：直接向父視窗發送訊息 (直接通訊)
      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'OAUTH_AUTH_SUCCESS',
            hash: window.location.hash,
            search: window.location.search
          }, window.location.origin);
        } catch (e) {
          console.error("傳送訊息給父視窗時發生錯誤:", e);
        }
      }

      // 2. 跨分頁 localStorage 備援機制 (當 window.opener 因為跨域政策/安全性被瀏覽器清除為 null 時，這能完美運作)
      try {
        localStorage.setItem('miye_oauth_success', JSON.stringify({
          timestamp: Date.now(),
          hash: window.location.hash,
          search: window.location.search
        }));
      } catch (e) {
        console.error("寫入 localStorage 失敗:", e);
      }

      // 3. 關閉彈出視窗：如果是彈出視窗（不論 window.opener 是否被瀏覽器切斷），均呼叫 window.close()
      window.close();

      // 4. 備援導向：若 500 毫秒後視窗仍未關閉（例如非彈出式，而是同分頁跳轉），則直接導向回首頁
      setTimeout(() => {
        navigate('/');
      }, 500);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zen-cream">
      <h2 className="text-2xl">帳號驗證中...</h2>
    </div>
  );
};
