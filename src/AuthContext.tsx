import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './db';
import { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  customer_phone?: string;
  gender?: string;
  address?: string;
  city?: string;
  district?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (data && !error) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // 強制檢查網址是否帶有 Supabase 的驗證參數 (如 #access_token)
    // 這在 AI Studio 預覽環境中特別重要，因為 hash 可能會被延遲處理
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery'))) {
        // 偵測到驗證參數，嘗試取得 Session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            setUser(session.user);
            fetchProfile(session.user.id);
            setLoading(false);
            
            // 顯示親切的提示
            toast.success('歡迎回來！驗證已完成，快來看看今天的精選好茶吧！', {
              duration: 5000,
              icon: '🍵',
            });
            
            // 清除網址上的參數，保持網址乾淨並避免重複觸發
            window.history.replaceState(null, '', window.location.pathname);
          }
        });
      }
    };

    // 取得初始 Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
      // 初始檢查 Hash
      checkHash();
    });

    const mergeTempResults = async (realUserId: string, tempSessionId: string) => {
      try {
        const { data: tempRows, error: tempError } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('session_id', tempSessionId);

        if (tempError) {
          console.error('Error fetching temp results for merge:', tempError);
          return;
        }

        if (!tempRows || tempRows.length === 0) {
          return;
        }

        const tempRecord = tempRows[0];
        const tempTestData = tempRecord.test_data || {};

        // Fetch user's existing record
        const { data: userRows, error: userError } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('test_data->>user_id', realUserId);

        if (userError) {
          console.error('Error fetching user results for merge:', userError);
          return;
        }

        if (userRows && userRows.length > 0) {
          // Merge temp results into existing user record
          const userRecord = userRows[0];
          const userTestData = userRecord.test_data || {};

          const mergedStageScores = {
            ...(userTestData.stage_scores || {}),
            ...(tempTestData.stage_scores || {})
          };

          const mergedCompletedStages = Array.from(new Set([
            ...(userTestData.completed_stages || []),
            ...(tempTestData.completed_stages || [])
          ]));

          const catType = tempTestData.cat_type || userTestData.cat_type || 'black_cat';

          const mergedTestData = {
            ...userTestData,
            user_id: realUserId,
            completed_stages: mergedCompletedStages,
            stage_scores: mergedStageScores,
            cat_type: catType
          };

          const { error: updateError } = await supabase
            .from('temp_test_results')
            .update({
              test_data: mergedTestData,
              session_id: null
            })
            .eq('id', userRecord.id);

          if (!updateError) {
            console.log('Merged temp results into existing user record successfully.');
            // Clean up temporary record
            await supabase
              .from('temp_test_results')
              .delete()
              .eq('id', tempRecord.id);
          } else {
            console.error('Merge update failed:', updateError.message);
          }
        } else {
          // No existing record for user, update temporary record's user_id and nullify session_id
          const updatedTestData = {
            ...tempTestData,
            user_id: realUserId
          };

          const { error: updateError } = await supabase
            .from('temp_test_results')
            .update({
              test_data: updatedTestData,
              session_id: null
            })
            .eq('id', tempRecord.id);

          if (!updateError) {
            console.log('Assigned temp results to user successfully.');
          } else {
            console.error('Assigning temp results failed:', updateError.message);
          }
        }

        // Clear local session ID to prevent redundant merge attempts
        localStorage.removeItem('session_id');
      } catch (err) {
        console.error('Exception during mergeTempResults:', err);
      }
    };

    // 監聽 Auth 狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        
        // Merge temp test results if available
        const tempSessionId = localStorage.getItem('session_id');
        if (tempSessionId) {
          mergeTempResults(session.user.id, tempSessionId);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);

      // 如果是從驗證信跳轉回來 (SIGNED_IN) 且網址帶有 hash
      if (event === 'SIGNED_IN' && window.location.hash) {
        toast.success('歡迎回來！驗證已完成，快來看看今天的精選好茶吧！', {
          duration: 5000,
          icon: '🍵',
        });
        
        // 清除網址上的 Access Token 等資訊
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    // 監聽來自登入彈出視窗的跨視窗訊息 (Message Event Listener)
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // 驗證來源是否為當前網域、AI Studio 預覽網址、Vercel 部署或本地開發伺服器
      if (
        origin !== window.location.origin &&
        !origin.endsWith('.run.app') &&
        !origin.endsWith('.vercel.app') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1')
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const hash = event.data.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace('#', '?'));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            setLoading(true);
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (error) throw error;
              if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
                await fetchProfile(data.session.user.id);
                toast.success('Google 快速登入成功！歡迎回來，覓野茶事。🍵');
              }
            } catch (err: any) {
              console.error('Google Auth Session Error:', err);
              toast.error('Google 登入失敗：' + (err.message || '無法解析登入資訊'));
            } finally {
              setLoading(false);
            }
          }
        }
      } else if (event.data?.type === 'LINE_AUTH_SUCCESS') {
        const { email, name, picture, lineId } = event.data;
        const linePassword = `LINE_${lineId}_MIYE_SECURE_PASS_2026`;
        setLoading(true);
        try {
          // 1. 嘗試直接以 LINE ID 做為密碼登入
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: linePassword,
          });

          if (signInError) {
            // 2. 登入失敗通常代表帳號不存在，因此為其自動註冊
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password: linePassword,
              options: {
                data: {
                  full_name: name,
                  avatar_url: picture,
                },
              },
            });

            if (signUpError) throw signUpError;

            if (signUpData.session) {
              setSession(signUpData.session);
              setUser(signUpData.session.user);
              await fetchProfile(signUpData.session.user.id);
              toast.success('LINE 註冊與登入成功！歡迎加入覓野茶事。🍵');
            } else {
              // 再次嘗試登入（以防信箱驗證設定的預設限制）
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password: linePassword,
              });
              if (retryError) {
                throw new Error('此專案需要電子郵件確認，請檢查您的信箱或手動登入。');
              }
              if (retryData.session) {
                setSession(retryData.session);
                setUser(retryData.session.user);
                await fetchProfile(retryData.session.user.id);
                toast.success('LINE 登入成功！🍵');
              }
            }
          } else if (signInData.session) {
            setSession(signInData.session);
            setUser(signInData.session.user);
            await fetchProfile(signInData.session.user.id);
            toast.success('LINE 快速登入成功！歡迎回來，覓野茶事。🍵');
          }
        } catch (err: any) {
          console.error('LINE Auth login error:', err);
          toast.error('LINE 登入失敗：' + (err.message || err));
        } finally {
          setLoading(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        toast.error('快速登入失敗：' + (event.data.error || '授權未完成'));
      }
    };

    window.addEventListener('message', handleMessage);

    // 監聽跨頁面/跨視窗的 localStorage 變化（當 window.opener 遺失時的完美備援方案）
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === 'miye_oauth_success' && event.newValue) {
        try {
          const oauthData = JSON.parse(event.newValue);
          const hash = oauthData.hash;
          if (hash) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              setLoading(true);
              try {
                const { data, error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (error) throw error;
                if (data.session) {
                  setSession(data.session);
                  setUser(data.session.user);
                  await fetchProfile(data.session.user.id);
                  toast.success('Google 快速登入成功！歡迎回來，覓野茶事。🍵');
                }
              } catch (err: any) {
                console.error('Google Auth Session Error (via storage):', err);
                toast.error('Google 登入失敗：' + (err.message || '無法解析登入資訊'));
              } finally {
                setLoading(false);
                // 清理 key 避免重複觸發
                localStorage.removeItem('miye_oauth_success');
              }
            }
          }
        } catch (e) {
          console.error('解析 Storage 事件失敗:', e);
        }
      } else if (event.key === 'miye_line_oauth_success' && event.newValue) {
        try {
          const oauthData = JSON.parse(event.newValue);
          const { email, name, picture, lineId } = oauthData;
          if (lineId) {
            setLoading(true);
            const linePassword = `LINE_${lineId}_MIYE_SECURE_PASS_2026`;
            try {
              // 1. 嘗試直接以 LINE ID 做為密碼登入
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: linePassword,
              });

              if (signInError) {
                // 2. 登入失敗通常代表帳號不存在，因此為其自動註冊
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                  email,
                  password: linePassword,
                  options: {
                    data: {
                      full_name: name,
                      avatar_url: picture,
                    },
                  },
                });

                if (signUpError) throw signUpError;

                if (signUpData.session) {
                  setSession(signUpData.session);
                  setUser(signUpData.session.user);
                  await fetchProfile(signUpData.session.user.id);
                  toast.success('LINE 註冊與登入成功！歡迎加入覓野茶事。🍵');
                } else {
                  // 再次嘗試登入（以防信箱驗證設定的預設限制）
                  const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                    email,
                    password: linePassword,
                  });
                  if (retryError) {
                    throw new Error('此專案需要電子郵件確認，請檢查您的信箱或手動登入。');
                  }
                  if (retryData.session) {
                    setSession(retryData.session);
                    setUser(retryData.session.user);
                    await fetchProfile(retryData.session.user.id);
                    toast.success('LINE 登入成功！🍵');
                  }
                }
              } else if (signInData.session) {
                setSession(signInData.session);
                setUser(signInData.session.user);
                await fetchProfile(signInData.session.user.id);
                toast.success('LINE 快速登入成功！歡迎回來，覓野茶事。🍵');
              }
            } catch (err: any) {
              console.error('LINE Auth login error (via storage):', err);
              toast.error('LINE 登入失敗：' + (err.message || err));
            } finally {
              setLoading(false);
              // 清理 key
              localStorage.removeItem('miye_line_oauth_success');
            }
          }
        } catch (e) {
          console.error('解析 LINE Storage 事件失敗:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
