import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';

import { ProductOption } from './services/productService';
import { getSettings, SiteSettings, DiscountRule } from './services/settingsService';
import { useAuth } from './AuthContext';
import { supabase } from './db';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  slug: string;
  stock?: number;
  selectedOption?: ProductOption | string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string, selectedOption?: ProductOption | string) => void;
  updateQuantity: (id: string, quantity: number, selectedOption?: ProductOption | string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  amountToFreeShipping: number;
  appliedDiscountRule: DiscountRule | null;
  discountAmount: number;
  refreshSettings: () => Promise<void>;
  appliedPromo: { code: string; name: string; discount: number; type: 'free_shipping' | 'discount' } | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; name: string; discount: number; type: 'free_shipping' | 'discount' } | null>(null);

  // 當使用者未登入或登出時，自動清除手動套用的優惠券
  useEffect(() => {
    if (!user) {
      setAppliedPromo(null);
    }
  }, [user]);

  const refreshSettings = useCallback(async () => {
    try {
      const s = await getSettings(true);
      setSettings(s);
    } catch (err) {
      console.error('Failed to reload settings in CartContext:', err);
    }
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings in CartContext:', err);
      }
    };
    loadSettings();
  }, []);

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      
      const parsedItems = JSON.parse(savedCart);
      
      // 強化過濾機制：移除 null, undefined 或缺少核心欄位的無效項目
      const validItems = Array.isArray(parsedItems) 
        ? parsedItems.filter(item => 
            item && 
            typeof item === 'object' && 
            item.id && 
            item.name && 
            typeof item.price === 'number'
          )
        : [];
      
      return validItems;
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      localStorage.removeItem('cart'); // 自動清空損毀的快取
      return [];
    }
  });

  // 渲染前的第二道防線：確保元件內部狀態也始終過濾無效值
  const validatedItems = items.filter(item => item && typeof item === 'object' && item.id);

  const freeShippingThreshold = 1000;

  // 使用 useRef 儲存最新的購物車項目狀態，保持常設回呼函式（callbacks）的穩定參考（stable identities）
  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: any, quantity: number = 1) => {
    if (!product.id || product.id === 'undefined') {
      console.error('Attempted to add product without valid ID to cart:', product);
      toast.error('商品異常，請重新整理頁面再試一次');
      return;
    }

    const optionKey = typeof product.selectedOption === 'object' ? product.selectedOption.label : product.selectedOption;
    
    // 從 itemsRef.current 讀取最新狀態，擺脫 callback 對 [items] 的依賴
    const existingItem = itemsRef.current.find(item => {
      const itemOptionKey = typeof item.selectedOption === 'object' ? item.selectedOption.label : item.selectedOption;
      return item.id === product.id && itemOptionKey === optionKey;
    });
    const totalRequested = (existingItem?.quantity || 0) + quantity;

    // 檢查總數量是否超過庫存
    if (product.stock !== undefined && totalRequested > product.stock) {
      toast.error(`抱歉，${product.name} 的庫存不足（現貨剩餘 ${product.stock} 件）。`, {
        id: `stock-error-${product.id}`
      });
      return;
    }

    const optLabel = typeof product.selectedOption === 'object' ? product.selectedOption.label : product.selectedOption;
    const message = existingItem 
      ? `已增加 ${product.name}${optLabel ? ` (${optLabel})` : ''} 的數量` 
      : `已將 ${product.name}${optLabel ? ` (${optLabel})` : ''} 加入購物車`;
    
    toast.success(message, {
      id: `add-to-cart-${product.id}-${optLabel || 'none'}`
    });

    setItems(prevItems => {
      const alreadyInCart = prevItems.some(item => {
        const itemOptionKey = typeof item.selectedOption === 'object' ? item.selectedOption.label : item.selectedOption;
        return item.id === product.id && itemOptionKey === optionKey;
      });

      if (alreadyInCart) {
        return prevItems.map(item => {
          const itemOptionKey = typeof item.selectedOption === 'object' ? item.selectedOption.label : item.selectedOption;
          return (item.id === product.id && itemOptionKey === optionKey)
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prevItems, {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price),
        image_url: String(product.image_url || product.image || ''),
        slug: String(product.slug || ''),
        quantity,
        stock: product.stock,
        selectedOption: product.selectedOption
      }];
    });
  }, []); // 絕對穩定的參考

  const removeFromCart = useCallback((id: string, selectedOption?: ProductOption | string) => {
    const optionKey = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    
    setItems(prevItems => prevItems.filter(item => {
      const itemOptionKey = typeof item.selectedOption === 'object' ? (item.selectedOption as any).label || item.selectedOption : item.selectedOption;
      return !(item.id === id && itemOptionKey === optionKey);
    }));
    toast.success('已從購物車移除商品', { id: `remove-cart-${id}-${optionKey || 'none'}` });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, selectedOption?: ProductOption | string) => {
    if (quantity < 1) return;
    const optionKey = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    
    // 從 itemsRef.current 讀取最新狀態
    const item = itemsRef.current.find(i => {
      const iOptionKey = typeof i.selectedOption === 'object' ? (i.selectedOption as any).label || i.selectedOption : i.selectedOption;
      return i.id === id && iOptionKey === optionKey;
    });
    
    if (item && item.stock !== undefined && quantity > item.stock) {
      toast.error(`抱歉，${item.name} 的庫存不足（現貨剩餘 ${item.stock} 件）。`, {
        id: `stock-error-${id}-${optionKey || 'none'}`
      });
      return;
    }

    setItems(prevItems => {
      return prevItems.map(item => {
        const itemOptionKey = typeof item.selectedOption === 'object' ? (item.selectedOption as any).label || item.selectedOption : item.selectedOption;
        return (item.id === id && itemOptionKey === optionKey) ? { ...item, quantity } : item;
      });
    });
  }, []); // 絕對穩定的參考

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    localStorage.removeItem('cart');
  }, []);

  const totalItems = validatedItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const subtotal = validatedItems.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0);
  
  // 1. 免運券開關設定：開啟後，當購物車總金額達免運門檻，且為會員，即自動免運；或手動套用首購免運優惠券。
  const isFreeShippingEnabled = settings ? settings.coupon_free_shipping_active !== false : true;
  const isFreeShipping = (!!user && isFreeShippingEnabled && (subtotal >= freeShippingThreshold)) || (appliedPromo?.type === 'free_shipping');
  const amountToFreeShipping = isFreeShipping ? 0 : (isFreeShippingEnabled ? Math.max(0, freeShippingThreshold - subtotal) : 0);

  // 2. 滿額折抵規則計算 (最高門檻優先套用，必須為會員，且排除需要手動輸入優惠代碼的規則)
  const appliedDiscountRule = useMemo(() => {
    if (!user) return null;
    if (!settings?.coupon_rules || settings.coupon_rules.length === 0) return null;
    const activeRules = settings.coupon_rules.filter(
      r => r.isActive && !r.code && r.type === 'threshold_discount' && subtotal >= r.threshold
    );
    if (activeRules.length === 0) return null;
    
    // 按門檻金額從大到小排序，優先套用滿足的最高門檻規則
    return activeRules.sort((a, b) => b.threshold - a.threshold)[0];
  }, [user, settings, subtotal]);

  const discountAmount = (appliedDiscountRule ? appliedDiscountRule.discountAmount : 0) + (appliedPromo?.type === 'discount' ? appliedPromo.discount : 0);

  // 3. 手動套用與驗證優惠代碼
  const applyPromoCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    // 強制登入限制：限制為『會員專屬』
    if (!user) {
      return { success: false, message: 'REQUIRES_LOGIN' };
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { success: false, message: '請輸入優惠碼' };
    }

    // 2. 首購免運券 (【覓野茶】)
    const isFirstBuyCode = trimmedCode === '【覓野茶】' || trimmedCode === '覓野茶';
    if (isFirstBuyCode) {
      try {
        // A. 歷史成功訂單筆數 >= 1
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('status', 'eq', '已取消');

        if (error) throw error;

        if (count !== null && count >= 1) {
          return { success: false, message: '此優惠僅限首次購買的會員使用' };
        }

        // B. 重複使用限制：檢查歷史訂單中的 note 欄位
        const { data: pastOrders, error: noteError } = await supabase
          .from('orders')
          .select('note')
          .eq('user_id', user.id)
          .not('status', 'eq', '已取消');

        if (noteError) throw noteError;

        const hasUsed = pastOrders?.some(order => 
          order.note && (
            order.note.includes('[已套用優惠碼: 【覓野茶】]') || 
            order.note.includes('[已套用優惠碼: 覓野茶]')
          )
        );

        if (hasUsed) {
          return { success: false, message: '使用過該優惠碼，無法重複使用' };
        }

        setAppliedPromo({
          code: '【覓野茶】',
          name: '首購免運優惠券',
          discount: 100, // 抵扣運費 100 元
          type: 'free_shipping'
        });
        
        return { success: true, message: '已成功套用首購免運優惠！' };
      } catch (err) {
        console.error('Error verifying first-buy coupon:', err);
        return { success: false, message: '驗證優惠碼時發生錯誤，請稍後再試' };
      }
    }

    // 3. 滿額折抵規則優惠碼判定
    if (settings?.coupon_rules && settings.coupon_rules.length > 0) {
      const matchedRule = settings.coupon_rules.find(
        r => r.isActive && r.code && r.code.trim().toUpperCase() === trimmedCode.toUpperCase()
      );

      if (matchedRule) {
        if (subtotal < matchedRule.threshold) {
          return { 
            success: false, 
            message: `此優惠碼需消費滿 NT$ ${matchedRule.threshold.toLocaleString()} 方可使用，目前還差 NT$ ${(matchedRule.threshold - subtotal).toLocaleString()}` 
          };
        }

        try {
          const { data: pastOrders, error: noteError } = await supabase
            .from('orders')
            .select('note')
            .eq('user_id', user.id)
            .not('status', 'eq', '已取消');

          if (noteError) throw noteError;

          const hasUsed = pastOrders?.some(order => 
            order.note && order.note.includes(`[已套用優惠碼: ${matchedRule.code}]`)
          );

          if (hasUsed) {
            return { success: false, message: '使用過該優惠碼，無法重複使用' };
          }

          setAppliedPromo({
            code: matchedRule.code,
            name: matchedRule.name,
            discount: matchedRule.discountAmount,
            type: 'discount'
          });

          return { success: true, message: `已成功套用「${matchedRule.name}」折抵 NT$ ${matchedRule.discountAmount}！` };
        } catch (err) {
          console.error('Error verifying custom coupon:', err);
          return { success: false, message: '驗證優惠碼時發生錯誤，請稍後再試' };
        }
      }
    }

    return { success: false, message: '此優惠碼無效或已過期' };
  }, [user, settings, subtotal]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
  }, []);

  // Memoize Context Value 確保子組件不會因為 Context 參考地址變更而觸發額外渲染
  const contextValue = useMemo(() => ({
    items: validatedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    freeShippingThreshold,
    isFreeShipping,
    amountToFreeShipping,
    appliedDiscountRule,
    discountAmount,
    refreshSettings,
    appliedPromo,
    applyPromoCode,
    removePromoCode
  }), [
    validatedItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    freeShippingThreshold,
    isFreeShipping,
    amountToFreeShipping,
    appliedDiscountRule,
    discountAmount,
    refreshSettings,
    appliedPromo,
    applyPromoCode,
    removePromoCode
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
