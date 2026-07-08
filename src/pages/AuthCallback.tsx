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
        navigate('/'); // 成功導回首頁
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
