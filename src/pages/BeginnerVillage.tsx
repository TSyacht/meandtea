import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getVillageConfig, 
  recordOptionClick, 
  BeginnerVillageConfig, 
  VillageStage, 
  Question 
} from '../services/beginnerVillageService';
import { 
  Compass, 
  Sparkles, 
  Share2, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Copy, 
  Check, 
  Moon, 
  Activity, 
  Eye, 
  Heart, 
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, supabaseUrl } from '../db';
import { useAuth } from '../AuthContext';
import { getSettings } from '../services/settingsService';
import { getAvatarUrl, getProducts, Product, getImageUrl } from '../services/productService';

// Confetti Component for celebration
const ConfettiRain = () => {
  const pieces = Array.from({ length: 150 });
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 4;
        const duration = 3 + Math.random() * 3;
        const size = 6 + Math.random() * 8;
        const rotate = Math.random() * 360;
        const colors = ['#707040', '#E39B24', '#C9A074', '#F5E6CA', '#8A9A86', '#D4AF37'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={i}
            initial={{ y: -50, x: `${left}vw`, rotate: 0, opacity: 1 }}
            animate={{ 
              y: '105vh', 
              rotate: rotate + 360,
              opacity: [1, 1, 0] 
            }}
            transition={{ 
              duration: duration, 
              delay: delay, 
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: size,
              height: size * (Math.random() > 0.5 ? 2 : 1),
              backgroundColor: randomColor,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        );
      })}
    </div>
  );
};

// Ultimate media player with video autoplay, loop, muted, playsinline & image poster/fallback mechanisms
const UltimateMedia: React.FC<{ imageUrl?: string; videoUrl?: string; forceUnmuted?: boolean }> = ({ imageUrl, videoUrl, forceUnmuted }) => {
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(!forceUnmuted);

  useEffect(() => {
    if (forceUnmuted) {
      setIsMuted(false);
    }
  }, [forceUnmuted]);

  const fallbackImage = imageUrl || 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=1000&q=90';

  if (videoUrl && !videoError) {
    return (
      <div className="relative w-full h-full">
        <video
          src={videoUrl}
          poster={fallbackImage}
          autoPlay
          loop={false}
          muted={isMuted}
          playsInline
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none select-none touch-none"
          style={{
            borderRadius: '2rem',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsMuted(!isMuted);
          }}
          className="absolute bottom-4 left-4 z-20 p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950/80 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-lg flex items-center justify-center cursor-pointer pointer-events-auto"
          title={isMuted ? "播放聲音" : "靜音"}
        >
          {isMuted ? <VolumeX size={16} className="text-white animate-pulse" /> : <Volume2 size={16} className="text-white" />}
        </button>
      </div>
    );
  }

  return (
    <img
      src={fallbackImage}
      alt="終極五維尋茶檔案"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none select-none touch-none"
      style={{
        borderRadius: '2rem',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      referrerPolicy="no-referrer"
      draggable="false"
      onContextMenu={(e) => { e.preventDefault(); return false; }}
    />
  );
};

export interface SavedStageResult {
  stageId: string;
  title: string;
  image: string;
  score: number;
  description: string;
}

export interface TeaCatType {
  id: string;
  name: string;
  image: string;
  description: string;
  personalityTrait: string;
}

export const TEA_CAT_TYPES: TeaCatType[] = [
  {
    id: 'black_cat',
    name: '春回紅茶貓',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&h=600&q=80',
    description: '愛好靜謐與深度思考，最愛在微雨的午後泡一杯暖和的深焙黑茶，享受安靜的閱讀與白噪音時光。',
    personalityTrait: '深沉冷靜、善於傾聽與觀照內心'
  },
  {
    id: 'spring_water_cat',
    name: '蜜果暑月貓',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&h=600&q=80',
    description: '情感細膩溫柔，如清晨流經山石的澄澈清泉。喜愛在潺潺溪畔放鬆，與甘甜的冷泡綠茶有著天生的絕佳默契。',
    personalityTrait: '溫柔體貼、感知細膩與喜愛和諧'
  },
  {
    id: 'orange_cat',
    name: '甘醇烏龍貓',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=600&h=600&q=80',
    description: '品位高雅，熱愛山居生活美學與品茗儀式感。在茶香與精緻器皿間體悟微小的幸福，最愛香氣高雅、如風般輕盈的野放白茶。',
    personalityTrait: '優雅從容、注重生活儀式感與美學'
  },
  {
    id: 'tabby_cat',
    name: '鮮嫩綠茶貓',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&h=600&q=80',
    description: '熱情奔放，渾身充滿山野生命的元力！喜歡親近自然，與同伴分享喜悅，最契合厚實飽滿、烘焙甘甜的原生焙火烏龍。',
    personalityTrait: '開朗樂觀、精力充沛與富有冒險精神'
  },
  {
    id: 'calico_cat',
    name: '放鬆福圓貓',
    image: 'https://images.unsplash.com/photo-1513360309081-36f5e878fc11?auto=format&fit=crop&w=600&h=600&q=80',
    description: '與大自然有著極深的靈性共鳴，是山林最忠實的守護者。聽得懂微風與落葉的對話，最懂得品鑑稀有奇特的台灣野生野放茶。',
    personalityTrait: '靈性敏銳、與自然合一與熱愛探索'
  }
];

const teaSoulDetails: Record<string, {
  tagline: string;
  tags: string[];
  element: string;
  analysis: string;
  teaRecommendationType: string;
}> = {
  black_cat: {
    tagline: '溫暖內斂、細膩包容的暖心守護者',
    tags: ['情感細緻', '默默守護', '沉穩溫和'],
    element: '大地靈魂元素',
    analysis: '在五關探索歷程中，您的特質人格與生活風格皆透露出溫暖而堅定的氣息。您不追求短暫的狂熱，而是鍾情於雋永的陪伴。對你而言，一杯好茶、一次深入靈魂的談話，都能在心中激盪出深刻的回甘。您的茶系靈魂是醇厚的紅茶，給予周遭無限的包容。',
    teaRecommendationType: '紅茶'
  },
  spring_water_cat: {
    tagline: '活潑靈動、朝氣蓬勃的陽光逐光者',
    tags: ['活力四射', '熱情純真', '靈感無限'],
    element: '朝陽烈火元素',
    analysis: '您的能量密碼和感官覺知充滿了生命力，宛如夏日正午的朝陽。不論身處何地，您都是那個帶來歡笑與希望的人。您適合品嘗充滿果香與蜜糖芬芳的茶品，在簡約而歡樂的氣氛中解密大自然的無限樂趣。您的茶系靈魂是蜜果香茶，將熱情播撒在身邊。',
    teaRecommendationType: '花草茶'
  },
  orange_cat: {
    tagline: '沈穩優雅、睿智深邃的時光品鑑家',
    tags: ['講究美學', '成熟優雅', '品味非凡'],
    element: '高山微風元素',
    analysis: '您是一位不折不扣的美學典雅追求者。在生活風格與器物美學上，您有著極高的自律與品味。您不會隨波逐流，而是專注於事物的本質與歲月沉澱的美好。您最適合半發酵、焙火工藝極佳的甘醇烏龍茶，在繁復的層次中細細品讀時光的精緻。',
    teaRecommendationType: '烏龍'
  },
  tabby_cat: {
    tagline: '清新脫俗、自由純真的森林尋密者',
    tags: ['崇尚自由', '靈性敏銳', '藝術天賦'],
    element: '純淨甘泉元素',
    analysis: '您對大自然有著天生的嚮往與純真的熱愛，在嗅覺與視覺感官上極具天賦。您的心靈一塵不染，喜歡在自由自在的呼吸中解密山林的美好。您不需要過多的人工雕琢，宛如一杯現泡的純淨綠茶，讓人感受一抹清涼與寧靜。',
    teaRecommendationType: '綠茶'
  },
  calico_cat: {
    tagline: '靈性敏銳、溫潤樂天的療癒大師',
    tags: ['圓融樂觀', '與自然共生', '療癒感知'],
    element: '山林雲霧元素',
    analysis: '您懂得在簡單的日常中品味幸福。不論是清晨的一縷微風，還是午後的斜陽，都能化作您心靈的療癒。您與大自然、小動物有著深厚的共鳴，生活在和諧與圓滿中。最適合您的是熟成福圓茶，在醇厚溫潤的香氣中，圓滿您的每一天。',
    teaRecommendationType: '熟茶'
  }
};

const getDimensionAnalysis = (id: string, score: number) => {
  switch (id) {
    case 'personality':
      return {
        dimension: '特質精神 (Spirituality)',
        meaning: '代表你內在精神的厚度與抗壓力',
        badge: score >= 8 ? '極致堅韌' : score >= 5 ? '柔和平衡' : '蓄勢內隱',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-500',
        detail: score >= 8 
          ? '你擁有極為罕見的精神厚度，如同高山巨木般能從容抵禦風霜，並滋養著身旁的萬物。' 
          : '你具備退一步海闊天空的智慧，兼具堅毅與柔韌，能優雅地面對各種環境挑戰。'
      };
    case 'zodiac':
      return {
        dimension: '宇宙共鳴 (Cosmic Synergy)',
        meaning: '象徵你與星辰萬物的契合度',
        badge: score >= 8 ? '天選星緣' : score >= 5 ? '和諧共感' : '星雲漫漫',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        detail: score >= 8 
          ? '你與宇宙星宿有着強烈的契合感，直覺敏銳非凡，深受自然韻律的庇護與啟發。' 
          : '你對周遭能量變動有着細緻的感受力，能和諧地順應自然節奏、自得其樂。'
      };
    case 'energy':
      return {
        dimension: '身心活力 (Vitality)',
        meaning: '反映你今日內在生命的充沛程度',
        badge: score >= 8 ? '生命朝陽' : score >= 5 ? '溫潤平衡' : '靜謐蘊能',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        detail: score >= 8 
          ? '你的體內正流淌著宛如正午朝陽的充沛能量，生命元氣滿滿，極具感染力。' 
          : '你處於最完美的溫潤平衡狀態，心境平和、呼吸綿長，是最佳的茶飲品鑑狀態。'
      };
    case 'lifestyle':
      return {
        dimension: '生活美學 (Aestheticism)',
        meaning: '展現你對生活細節與儀式感的講究',
        badge: score >= 8 ? '美學大師' : score >= 5 ? '典雅生活' : '隨性自然',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        barColor: 'bg-indigo-500',
        detail: score >= 8 
          ? '你將生活昇華為藝術，對器物、茶與心意極為挑剔，追求無瑕的美學儀式感。' 
          : '你講究生活的優雅與舒適度，注重細節與質感，懂得在忙碌中營造一方淨土。'
      };
    case 'sensory':
      return {
        dimension: '感官感知 (Perception)',
        meaning: '顯示你對茶香、自然細節的敏銳度',
        badge: score >= 8 ? '天生品茶師' : score >= 5 ? '敏銳感知' : '自然共振',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        barColor: 'bg-purple-500',
        detail: score >= 8 
          ? '你的感官極具天賦，一呼一吸間便能解密山林的奧妙，是天生的茶香密碼破譯者。' 
          : '你對細微的芬芳與口感層次有著很好的鑒賞力，能充分享受一杯茶帶來的多維樂趣。'
      };
    default:
      return {
        dimension: '未知維度',
        meaning: '尋茶之旅的神秘維度',
        badge: '未知狀態',
        color: 'text-stone-600 bg-stone-50 border-stone-200',
        barColor: 'bg-stone-500',
        detail: '神祕莫測的感知維度。'
      };
  }
};

export const BeginnerVillage: React.FC = () => {
  const saveStageScoreToLocalStorage = (stageId: string, result: { title: string; image: string; score: number; description: string }) => {
    try {
      const existing = localStorage.getItem('miye_village_stage_score');
      const scoreObj = existing ? JSON.parse(existing) : {};
      scoreObj[stageId] = result;
      localStorage.setItem('miye_village_stage_score', JSON.stringify(scoreObj));
    } catch (e) {
      console.error('Failed to save stage score to localStorage', e);
    }
  };

  const getStageSummaryData = () => {
    let savedScores: Record<string, { score: number; title: string; image: string; description: string }> = {};
    try {
      const existing = localStorage.getItem('miye_village_stage_score');
      if (existing) {
        savedScores = JSON.parse(existing);
      }
    } catch (e) {
      console.error(e);
    }

    // Merge in any database results to ensure they take priority
    if (dbResults && dbResults.length > 0) {
      dbResults.forEach(r => {
        const parts = r.result_content?.split('：') || [];
        const title = parts[0] || '';
        const description = parts.slice(1).join('：') || '';
        
        // Robust number parsing
        const parsedScore = typeof r.score === 'number' ? r.score : parseInt(r.score as any) || 0;
        
        savedScores[r.stage_id] = {
          score: parsedScore,
          title: title,
          description: description,
          image: r.image_url || ''
        };
      });
    }

    const defaultStages = [
      {
        id: 'personality',
        name: '尋茶人格',
        title: '堅韌大安水蓑衣型',
        image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
        score: 6,
        description: '默默紮根、滋養周遭，在冷靜中展現無窮的堅韌生命力。'
      },
      {
        id: 'zodiac',
        name: '星座茶緣',
        title: '烈焰焙火黑茶 (火象星緣)',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
        score: 4,
        description: '熱情奔放如烈火，適合溫潤醇厚的焙火茶，溫暖身心。'
      },
      {
        id: 'energy',
        name: '今日能量值',
        title: '夏日正午朝陽 (能量 95%)',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
        score: 3,
        description: '充沛的生命元力，與大自然萬物熱烈共生，充滿正能量。'
      },
      {
        id: 'lifestyle',
        name: '生活風格',
        title: '細微美學典雅型',
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80',
        score: 3,
        description: '在茶與器、心意交織間品讀幸福，講究生活中的每一處精緻細節。'
      },
      {
        id: 'sensory',
        name: '感官密碼',
        title: '嗅覺與純郁味覺品茶師',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
        score: 3,
        description: '對茶香與大自然的芬芳極具天賦，一呼一吸間解密山林的美好。'
      }
    ];

    return defaultStages.map(def => {
      const saved = savedScores[def.id];
      if (saved) {
        const finalScore = saved.score !== undefined && saved.score !== null ? Number(saved.score) : Number(def.score);
        return {
          id: def.id,
          name: def.name,
          title: saved.title || def.title,
          image: saved.image || def.image,
          score: isNaN(finalScore) ? Number(def.score) : finalScore,
          description: saved.description || def.description
        };
      }
      return def;
    });
  };

  const catNames: Record<string, string> = {
    black_cat: "春回紅茶貓",
    spring_water_cat: "蜜果暑月貓",
    orange_cat: "甘醇烏龍貓",
    tabby_cat: "鮮嫩綠茶貓",
    calico_cat: "放鬆福圓貓"
  };

  const getCatTypeForStage = (stageId: string, score: number, title: string): string => {
    if (stageId === 'personality') {
      if (score <= 3) return 'black_cat';
      if (score <= 5) return 'spring_water_cat';
      if (score <= 7) return 'orange_cat';
      if (score <= 9) return 'tabby_cat';
      return 'calico_cat';
    } else if (stageId === 'zodiac') {
      const t = title || '';
      if (t.includes('火') || t.includes('牡羊') || t.includes('獅子') || t.includes('射手') || t.includes('烈焰')) {
        return 'tabby_cat';
      } else if (t.includes('水') || t.includes('雙魚') || t.includes('巨蟹') || t.includes('天蠍') || t.includes('清泉')) {
        return 'spring_water_cat';
      } else if (t.includes('土') || t.includes('金牛') || t.includes('處女') || t.includes('摩羯') || t.includes('炭香')) {
        return 'black_cat';
      } else if (t.includes('風') || t.includes('雙子') || t.includes('天秤') || t.includes('水瓶') || t.includes('微風')) {
        return 'orange_cat';
      } else {
        return 'calico_cat';
      }
    } else if (stageId === 'energy') {
      if (score <= 2) return 'black_cat';
      if (score <= 4) return 'spring_water_cat';
      if (score <= 6) return 'orange_cat';
      if (score <= 8) return 'tabby_cat';
      return 'calico_cat';
    } else if (stageId === 'lifestyle') {
      if (score <= 2) return 'black_cat';
      if (score <= 4) return 'spring_water_cat';
      if (score <= 6) return 'orange_cat';
      if (score <= 8) return 'tabby_cat';
      return 'calico_cat';
    } else if (stageId === 'sensory') {
      if (score <= 2) return 'black_cat';
      if (score <= 4) return 'spring_water_cat';
      if (score <= 6) return 'orange_cat';
      if (score <= 8) return 'tabby_cat';
      return 'calico_cat';
    }
    return 'black_cat';
  };

  const getCatImage = (catType: string, avatarsList: any[]) => {
    const targetName = catNames[catType] || catType;
    const found = avatarsList?.find(a => a.name === targetName);
    if (found?.url) {
      return getAvatarUrl(found.url) || found.url;
    }
    const defaultImages: Record<string, string> = {
      black_cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&h=600&q=80',
      spring_water_cat: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&h=600&q=80',
      orange_cat: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=600&h=600&q=80',
      tabby_cat: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&h=600&q=80',
      calico_cat: 'https://images.unsplash.com/photo-1513360309081-36f5e878fc11?auto=format&fit=crop&w=600&h=600&q=80'
    };
    return defaultImages[catType] || defaultImages.black_cat;
  };

  const getMatchedTeaCats = (stagesData: { id: string; name: string; title: string; image: string; score: number; description: string }[]) => {
    const votes: Record<string, number> = {
      black_cat: 0,
      spring_water_cat: 0,
      orange_cat: 0,
      tabby_cat: 0,
      calico_cat: 0
    };

    stagesData.forEach(stage => {
      const score = stage.score;
      const catType = getCatTypeForStage(stage.id, score, stage.title);
      if (catType && votes[catType] !== undefined) {
        votes[catType] += 1;
      }
    });

    let maxVotes = 0;
    Object.values(votes).forEach(v => {
      if (v > maxVotes) maxVotes = v;
    });

    if (maxVotes === 0) {
      return [{
        id: 'black_cat',
        name: '春回紅茶貓',
        image: getCatImage('black_cat', systemAvatars)
      }];
    }

    const matchedKeys = Object.keys(votes).filter(k => votes[k] === maxVotes);
    return matchedKeys.map(key => ({
      id: key,
      name: catNames[key] || key,
      image: getCatImage(key, systemAvatars)
    })).filter(Boolean);
  };

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [dbResults, setDbResults] = useState<any[]>([]);
  const [systemAvatars, setSystemAvatars] = useState<any[]>([]);
  const [config, setConfig] = useState<BeginnerVillageConfig | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeStageId, setActiveStageId] = useState<string | null>(() => {
    return sessionStorage.getItem('miye_active_stage_id');
  });
  const [userCompletedAllLevels, setUserCompletedAllLevels] = useState<boolean>(false);
  
  // Quiz specific states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(() => {
    const val = sessionStorage.getItem('miye_current_question_index');
    return val !== null ? parseInt(val) : 0;
  });
  const [runningScore, setRunningScore] = useState<number>(() => {
    const val = sessionStorage.getItem('miye_running_score');
    return val !== null ? parseInt(val) : 0;
  });
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(() => {
    return sessionStorage.getItem('miye_selected_zodiac');
  });
  
  // Result screen active states
  const [stageResult, setStageResult] = useState<{
    stageId: string;
    title: string;
    image: string;
    socialText: string;
    description?: string;
  } | null>(() => {
    const val = sessionStorage.getItem('miye_stage_result');
    return val ? JSON.parse(val) : null;
  });

  // Ultimate Completion Screen State
  const [showUltimateScreen, setShowUltimateScreen] = useState<boolean>(() => {
    const val = sessionStorage.getItem('miye_show_ultimate_screen');
    return val === 'true';
  });
  const [hasBegunCeremony, setHasBegunCeremony] = useState<boolean>(() => {
    const val = sessionStorage.getItem('miye_has_begun_ceremony');
    return val === 'true';
  });
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [inIntroScreen, setInIntroScreen] = useState<boolean>(() => {
    const val = sessionStorage.getItem('miye_in_intro_screen');
    return val !== null ? val === 'true' : false;
  });
  const [selectedReviewStageId, setSelectedReviewStageId] = useState<string | null>(() => {
    return sessionStorage.getItem('miye_selected_review_stage_id');
  });
  const [productsList, setProductsList] = useState<Product[]>([]);

  // sessionStorage synchronization effects
  useEffect(() => {
    if (activeStageId !== null) {
      sessionStorage.setItem('miye_active_stage_id', activeStageId);
    } else {
      sessionStorage.removeItem('miye_active_stage_id');
    }
  }, [activeStageId]);

  useEffect(() => {
    sessionStorage.setItem('miye_in_intro_screen', String(inIntroScreen));
  }, [inIntroScreen]);

  useEffect(() => {
    sessionStorage.setItem('miye_current_question_index', String(currentQuestionIndex));
  }, [currentQuestionIndex]);

  useEffect(() => {
    sessionStorage.setItem('miye_running_score', String(runningScore));
  }, [runningScore]);

  useEffect(() => {
    if (selectedZodiac !== null) {
      sessionStorage.setItem('miye_selected_zodiac', selectedZodiac);
    } else {
      sessionStorage.removeItem('miye_selected_zodiac');
    }
  }, [selectedZodiac]);

  useEffect(() => {
    if (stageResult !== null) {
      sessionStorage.setItem('miye_stage_result', JSON.stringify(stageResult));
    } else {
      sessionStorage.removeItem('miye_stage_result');
    }
  }, [stageResult]);

  useEffect(() => {
    sessionStorage.setItem('miye_show_ultimate_screen', String(showUltimateScreen));
  }, [showUltimateScreen]);

  useEffect(() => {
    sessionStorage.setItem('miye_has_begun_ceremony', String(hasBegunCeremony));
  }, [hasBegunCeremony]);

  useEffect(() => {
    if (selectedReviewStageId !== null) {
      sessionStorage.setItem('miye_selected_review_stage_id', selectedReviewStageId);
    } else {
      sessionStorage.removeItem('miye_selected_review_stage_id');
    }
  }, [selectedReviewStageId]);

  // Auto scroll-to-top on state transitions: starting quiz, switching questions, viewing results, or returning to map.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeStageId, currentQuestionIndex, stageResult, showUltimateScreen, inIntroScreen]);

  const fetchVillageResultsFromDB = async (currentSessionId?: string | null) => {
    const sessionId = currentSessionId || localStorage.getItem('session_id');
    const userId = user?.id || null;

    let record: any = null;

    try {
      if (sessionId) {
        const { data, error } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          record = data[0];
        }
      }

      if (!record && userId) {
        const { data, error } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('test_data->>user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          record = data[0];
        }
      }

      if (record && record.test_data) {
        const testData = record.test_data;
        const stageScores = testData.stage_scores || {};
        const completedList = testData.completed_stages || Object.keys(stageScores);

        const mappedResults = Object.keys(stageScores).map(sId => {
          const val = stageScores[sId];
          return {
            stage_id: sId,
            score: val.score,
            result_content: `${val.title}：${val.description}`,
            image_url: val.image,
            cat_type: testData.cat_type || 'black_cat'
          };
        });

        // Safe-merge completed list with local storage to avoid erasing any newly completed stage results from stale DB record
        let localCompleted: string[] = [];
        try {
          const existingCompleted = localStorage.getItem('miye_village_completed');
          if (existingCompleted) {
            localCompleted = JSON.parse(existingCompleted);
          }
        } catch (e) {}
        const mergedCompleted = Array.from(new Set([...localCompleted, ...completedList]));

        setDbResults(mappedResults);
        setCompletedStages(mergedCompleted);
        localStorage.setItem('miye_village_completed', JSON.stringify(mergedCompleted));

        const scoreObj: Record<string, any> = {};
        try {
          const existing = localStorage.getItem('miye_village_stage_score');
          if (existing) {
            Object.assign(scoreObj, JSON.parse(existing));
          }
        } catch (e) {}

        Object.keys(stageScores).forEach(sId => {
          const val = stageScores[sId];
          scoreObj[sId] = {
            title: val.title,
            description: val.description,
            image: val.image,
            score: val.score
          };
        });
        localStorage.setItem('miye_village_stage_score', JSON.stringify(scoreObj));

        if (mergedCompleted.length >= 5) {
          setUserCompletedAllLevels(true);
          localStorage.setItem('user_completed_all_levels', 'true');
          const closedUltimate = sessionStorage.getItem('miye_closed_ultimate') === 'true';
          if (!closedUltimate) {
            setShowUltimateScreen(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching village results:', err);
    }
  };

  const saveVillageResult = async (stageId: string, score: number, title: string, description: string, image: string) => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('session_id', sessionId);
    }

    const userId = user?.id || null;
    let existingRow: any = null;

    try {
      if (userId) {
        const { data } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('test_data->>user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (data && data.length > 0) {
          existingRow = data[0];
        }
      }

      if (!existingRow && sessionId) {
        const { data } = await supabase
          .from('temp_test_results')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          existingRow = data[0];
        }
      }
    } catch (err) {
      console.error('Error finding existing test result:', err);
    }

    const currentTestData = existingRow?.test_data || {
      user_id: userId,
      completed_stages: [],
      stage_scores: {}
    };

    if (userId) {
      currentTestData.user_id = userId;
    }

    if (!currentTestData.stage_scores) {
      currentTestData.stage_scores = {};
    }
    currentTestData.stage_scores[stageId] = {
      score,
      title,
      description,
      image
    };

    const completedList = currentTestData.completed_stages || [];
    if (!completedList.includes(stageId)) {
      completedList.push(stageId);
    }
    currentTestData.completed_stages = completedList;

    const stagesData = Object.keys(currentTestData.stage_scores).map(sId => {
      const val = currentTestData.stage_scores[sId];
      return {
        id: sId,
        score: val.score,
        title: val.title,
        image: val.image,
        description: val.description,
        name: sId
      };
    });

    const matchedCats = getMatchedTeaCats(stagesData);
    const primaryCat = matchedCats[0]?.id || 'black_cat';
    currentTestData.cat_type = primaryCat;

    try {
      if (existingRow) {
        await supabase
          .from('temp_test_results')
          .update({
            test_data: currentTestData,
            session_id: userId ? null : sessionId
          })
          .eq('id', existingRow.id);
      } else {
        await supabase
          .from('temp_test_results')
          .insert([{
            session_id: userId ? null : sessionId,
            test_data: currentTestData
          }]);
      }
    } catch (err) {
      console.error('Error saving temp test result:', err);
    }

    fetchVillageResultsFromDB(sessionId);
  };

  useEffect(() => {
    if (showUltimateScreen) {
      setHasBegunCeremony(false);
    }
  }, [showUltimateScreen]);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Ensure session_id exists
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('session_id', sessionId);
    }

    const loadConfigAndUserData = async () => {
      setLoading(true);
      try {
        const data = await getVillageConfig();
        setConfig(data);

        // Fetch site settings for avatars (instantly refetched to clear cache!)
        const settings = await getSettings(true);
        if (settings?.system_avatars) {
          setSystemAvatars(settings.system_avatars);
        }

        await fetchVillageResultsFromDB(sessionId);

        try {
          const prods = await getProducts();
          setProductsList(prods);
        } catch (pe) {
          console.error('Failed to load products in BeginnerVillage:', pe);
        }
      } catch (err) {
        console.error('Error loading Beginner Village data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Load user_completed_all_levels
    const completedAll = localStorage.getItem('user_completed_all_levels') === 'true';
    if (completedAll) {
      setUserCompletedAllLevels(true);
      const closedUltimate = sessionStorage.getItem('miye_closed_ultimate') === 'true';
      if (!closedUltimate) {
        setShowUltimateScreen(true);
      }
    }

    // Load progress from localStorage as fallback/initial
    const saved = localStorage.getItem('miye_village_completed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedStages(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadConfigAndUserData();
  }, [user]);

  // Check if we meet the ultimate reward trigger on completing another stage
  const verifyOverallCompletion = (updatedCompleted: string[]) => {
    if (updatedCompleted.length >= 5) {
      setUserCompletedAllLevels(true);
      localStorage.setItem('user_completed_all_levels', 'true');
      setTimeout(() => {
        toast.success('恭喜你！解鎖完整五維尋茶檔案！', { duration: 5000, icon: '🎉' });
        setShowConfetti(true);
        setShowUltimateScreen(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 9000); // 9 seconds total duration for 1 drop
      }, 1500);
    }
  };

  const currentStage = config?.stages.find(s => s.id === activeStageId);

  const handleStageClick = (stageId: string) => {
    if (completedStages.includes(stageId)) {
      setSelectedReviewStageId(stageId);
      return;
    }

    if (userCompletedAllLevels) {
      // Intercept and redirect to completion page
      setShowUltimateScreen(true);
      return;
    }
    // Reset stage state
    setActiveStageId(stageId);
    setCurrentQuestionIndex(0);
    setRunningScore(0);
    setSelectedZodiac(null);
    setStageResult(null);
    setInIntroScreen(true);
  };

  const handleAnswerSubmit = async (scoreValue: number, questionId: string, optionId: string) => {
    if (!activeStageId || !currentStage) return;

    // Log telemetry statistics to server in background
    recordOptionClick(activeStageId, questionId, optionId);

    const nextScore = runningScore + scoreValue;
    setRunningScore(nextScore);

    // Advanced question index
    if (currentQuestionIndex < currentStage.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate outcome scorecard
      const scoreRanges = currentStage.ranges || [];
      const matchedRange = scoreRanges.find(r => nextScore >= r.minScore && nextScore <= r.maxScore) 
        || scoreRanges[scoreRanges.length - 1] 
        || { title: '尋茶人成果', image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80', socialText: '快來覓野茶新手村解鎖你的專屬尋茶基因吧！', description: '' };

      // Set outcome
      setStageResult({
        stageId: activeStageId,
        title: matchedRange.title,
        image: matchedRange.image,
        socialText: matchedRange.socialText,
        description: (matchedRange as any).description || ''
      });

      // Save stage result details
      saveStageScoreToLocalStorage(activeStageId, {
        title: matchedRange.title,
        image: matchedRange.image,
        score: nextScore,
        description: (matchedRange as any).description || ''
      });

      // Save progress
      const updated = completedStages.includes(activeStageId)
        ? completedStages
        : [...completedStages, activeStageId];
      
      setCompletedStages(updated);
      localStorage.setItem('miye_village_completed', JSON.stringify(updated));

      const descText = (matchedRange as any).description || matchedRange.socialText || '';
      saveVillageResult(activeStageId, nextScore, matchedRange.title, descText, matchedRange.image);
    }
  };

  const handleZodiacSelect = (zodiacName: string) => {
    if (!currentStage || !currentStage.zodiacMappings) return;
    
    setSelectedZodiac(zodiacName);

    // Log zodiac option selected as anonymous statistic
    recordOptionClick('zodiac', 'zodiac_select', zodiacName);

    const match = currentStage.zodiacMappings.find(m => m.title.includes(zodiacName))
      || currentStage.zodiacMappings.find(m => m.title.includes(zodiacName.replace('座', '')))
      || currentStage.zodiacMappings.find(m => m.zodiacs && m.zodiacs.includes(zodiacName))
      || currentStage.zodiacMappings[0];

    setStageResult({
      stageId: 'zodiac',
      title: match.title,
      image: match.image,
      socialText: match.socialText,
      description: match.description || ''
    });

    // Save stage result details
    saveStageScoreToLocalStorage('zodiac', {
      title: match.title,
      image: match.image,
      score: 0, // Zodiac stage is choice based, default score offset
      description: match.description || ''
    });

    // Save progress
    const updated = completedStages.includes('zodiac')
      ? completedStages
      : [...completedStages, 'zodiac'];
    
    setCompletedStages(updated);
    localStorage.setItem('miye_village_completed', JSON.stringify(updated));

    const descText = match.description || match.socialText || '';
    saveVillageResult('zodiac', 0, match.title, descText, match.image);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已將分享文字與連結複製至剪貼簿！');
    }).catch(() => {
      toast.error('複製失敗，請手動複製');
    });
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(【[^】]+】)/g);
    return parts.map((part, index) => {
      if (part.startsWith('【') && part.endsWith('】')) {
        const isCoupon = part.includes('折價') || part.includes('折') || part.includes('500');
        const innerText = part.slice(1, -1);
        return (
          <span key={index} className={isCoupon ? "text-amber-700 font-bold font-serif" : "text-[#707040] font-bold"}>
            【{innerText}】
          </span>
        );
      }
      return part;
    });
  };

  const handleImageDownload = async (imageUrl: string, titleName: string) => {
    try {
      toast.loading('準備檔案中...');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `覓野茶_新手村_${titleName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.dismiss();
      toast.success('圖片下載成功！');
    } catch (e) {
      toast.dismiss();
      // Safe fallback opening image in new tab for mobile/browser sandbox restrictions
      window.open(imageUrl, '_blank');
      toast.success('已在新視窗開啟圖片，可直接長按儲存！');
    }
  };

  const triggerSocialShare = (platform: string, invitationText: string) => {
    const shareUrl = 'https://meandtea.vercel.app/beginner-village';
    const message = invitationText ? `${invitationText}\n\n👉 立即前往探索新手村專屬測驗：${shareUrl}` : `👉 立即前往探索新手村專屬測驗：${shareUrl}`;

    if (platform === 'line') {
      const lineText = invitationText || '來測測你的尋茶人格與專屬五維檔案吧！';
      const hasUrl = lineText.includes('http://') || lineText.includes('https://');
      const finalLineText = hasUrl ? lineText : `${lineText}\n\n👉 立即前往探索新手村專屬測驗：${shareUrl}`;
      window.open(`https://social-plugins.line.me/lineit/share?url=&text=${encodeURIComponent(finalLineText)}`, '_blank');
    } else if (platform === 'threads') {
      window.open(`https://threads.net/intent/post?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(invitationText || '')}`, '_blank');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(message).then(() => {
        toast.success('💡 Instagram 分享提醒\n已將分享連結與精彩內容複製至剪貼簿！開啟 Instagram 貼上即可分享！', {
          duration: 5000,
          icon: '📸'
        });
      }).catch(() => {
        toast.error('複製失敗，請手動複製');
      });
    }
  };

  const handleBackToVillage = () => {
    setActiveStageId(null);
    setStageResult(null);
    setCurrentQuestionIndex(0);
    setRunningScore(0);
    setSelectedZodiac(null);

    // Trigger ultimate animation page if just completed all 5
    verifyOverallCompletion(completedStages);
  };

  const handleRestartAll = () => {
    setCompletedStages([]);
    localStorage.removeItem('miye_village_completed');
    localStorage.removeItem('miye_village_stage_score');
    localStorage.removeItem('user_completed_all_levels');
    sessionStorage.removeItem('miye_village_completed');
    sessionStorage.removeItem('miye_closed_ultimate');
    sessionStorage.removeItem('miye_has_begun_ceremony');
    setUserCompletedAllLevels(false);
    setStageResult(null);
    setShowUltimateScreen(false);
    setShowConfetti(false);
    setCurrentQuestionIndex(0);
    setRunningScore(0);
    setSelectedZodiac(null);
    setActiveStageId('personality');
    setShowResetConfirm(false);
    setInIntroScreen(false);
    toast.success('進度已完全重置，歡迎自第一關再度啟程！');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#707040] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-sans text-sm tracking-wider text-stone-500">正在鋪設新手村林道...</p>
        </div>
      </div>
    );
  }

  // Define position mappings on map coordinate container (Circular concept inspired by image_12b3e3)
  // We use responsive styles to anchor them perfectly.
  const mapNodes = [
    { 
      id: 'personality', 
      name: '尋茶人格', 
      desc: '探索心靈深處的草木角色',
      posClass: 'md:top-[12%] md:left-[50%] md:-translate-x-1/2 md:-translate-y-1/2',
      mobileOrder: 'order-1',
      bg: 'bg-gradient-to-br from-[#707040] to-[#5a5a31] text-white border border-[#707040]',
      tag: '⭐ 核心引導'
    },
    { 
      id: 'zodiac', 
      name: '星座茶緣', 
      desc: '解鎖本命星空的茶草因緣',
      posClass: 'md:top-[46%] md:left-[20%] md:-translate-x-1/2 md:-translate-y-1/2',
      mobileOrder: 'order-2',
      bg: 'bg-white hover:bg-stone-50 text-stone-800 border border-[#707040]/10 hover:border-[#707040]/50'
    },
    { 
      id: 'energy', 
      name: '今日能量值', 
      desc: '診斷你當下的自然原力指數',
      posClass: 'md:top-[46%] md:right-[20%] md:translate-x-1/2 md:-translate-y-1/2',
      mobileOrder: 'order-3',
      bg: 'bg-white hover:bg-stone-50 text-stone-800 border border-[#707040]/10 hover:border-[#707040]/50'
    },
    { 
      id: 'lifestyle', 
      name: '生活風格', 
      desc: '透析你在日常的禪意美學',
      posClass: 'md:bottom-[15%] md:left-[26%] md:-translate-x-1/2 md:translate-y-1/2',
      mobileOrder: 'order-4',
      bg: 'bg-white hover:bg-stone-50 text-stone-800 border border-[#707040]/10 hover:border-[#707040]/50'
    },
    { 
      id: 'sensory', 
      name: '感官密碼', 
      desc: '破譯你與森林花葉相觸的天賦',
      posClass: 'md:bottom-[15%] md:right-[26%] md:translate-x-1/2 md:translate-y-1/2',
      mobileOrder: 'order-5',
      bg: 'bg-white hover:bg-stone-50 text-stone-800 border border-[#707040]/10 hover:border-[#707040]/50'
    }
  ];

  const listZodiacs = [
    '牡羊座', '金牛座', '雙子座', '巨蟹座',
    '獅子座', '處女座', '天秤座', '天蠍座',
    '射手座', '摩羯座', '水瓶座', '雙魚座'
  ];

  const resolveMapBackgroundUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rootUrl = supabaseUrl || 'https://ftqyzxrvghfdspgjampd.supabase.co';
    return `${rootUrl.replace(/\/$/, '')}/storage/v1/object/public/novice-village/${path}`;
  };

  const hasMapBg = config?.map_background && config.map_background.trim() !== '';

  return (
    <div 
      className="min-h-screen pt-28 pb-20 relative overflow-hidden font-sans bg-[#F9F8F4] bg-stone-50"
    >
      {/* Background & Overlay layer */}
      {hasMapBg && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#F9F8F4] bg-stone-50 border-none outline-none shadow-none">
          <div 
            className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{ 
              backgroundImage: `url(${resolveMapBackgroundUrl(config.map_background)})`,
              opacity: 1,
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity'
            }}
          />
        </div>
      )}

      {/* Background elegant details */}
      {!hasMapBg && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#707040]/5 blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#E39B24]/5 blur-3xl -z-10" />
        </>
      )}

      {showConfetti && <ConfettiRain />}

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1. ULTIMATE CELEBRATION SCREEN */}
          {showUltimateScreen ? (
            <motion.div
              key="ultimate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl text-center relative overflow-hidden"
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform, opacity',
                isolation: 'isolate',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)'
              }}
            >
              <div className="bg-[#707040]/10 py-8 px-6 border-b border-[#707040]/10 relative rounded-t-3xl">
                <button
                  onClick={() => {
                    setShowUltimateScreen(false);
                    sessionStorage.setItem('miye_closed_ultimate', 'true');
                  }}
                  className="absolute right-6 top-6 text-stone-500 hover:text-stone-800 transition-colors p-1"
                  title="回到探索地圖"
                >
                  <X size={20} />
                </button>
                <div className="inline-flex items-center gap-2 text-[#707040] mb-2">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest font-mono">ULTIMATE DOSSIER</span>
                </div>
                <h1 className="text-2xl font-bold text-stone-800 tracking-wide font-sans">
                  終極五維尋茶檔案總圖卡
                </h1>
                <p className="text-xs text-stone-500 mt-1">你已被認證為「覓野山林特等保育官」</p>
              </div>

              {/* dossier picture wrapper */}
              <div className="p-8 space-y-8">
                <div 
                  className="relative group max-w-[450px] mx-auto aspect-[9/16] bg-transparent pointer-events-auto select-none touch-none shadow-lg"
                  style={{
                    borderRadius: '2rem',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    isolation: 'isolate',
                  }}
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                >
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden bg-transparent"
                    style={{
                      borderRadius: '2rem',
                      border: '0px',
                      outline: 'none',
                      willChange: 'transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      isolation: 'isolate',
                    }}
                  >
                    {!hasBegunCeremony ? (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#1c1d15] via-[#24251b] to-[#12130e] flex flex-col items-center justify-between p-8 text-center select-none overflow-hidden relative border border-stone-800">
                        {/* Ambient light glow */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="my-auto space-y-6 relative z-10">
                          {/* Sparkly / gold seal icon */}
                          <div className="flex justify-center">
                            <div className="relative">
                              <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-lg animate-pulse" />
                              <div className="relative bg-amber-500/10 border border-amber-500/30 rounded-full p-5 text-amber-500 shadow-inner flex items-center justify-center">
                                <Sparkles size={40} className="animate-pulse text-[#E39B24]" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 font-mono block">
                              CEREMONY UNLOCK
                            </span>
                            <h2 className="text-xl font-bold text-amber-100 tracking-wider">
                              尋茶啟程儀式
                            </h2>
                          </div>

                          <p className="text-xs text-stone-300 leading-relaxed max-w-[280px] mx-auto font-medium">
                            尋茶人，您已順利通過 5 大山林測驗！點擊下方「開啟儀式」解鎖您的終極五維尋茶檔案，並同步啟動專屬音效體驗。
                          </p>
                        </div>

                        <div className="w-full max-w-xs mx-auto pb-4 relative z-10">
                          <button
                            onClick={() => setHasBegunCeremony(true)}
                            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm tracking-widest rounded-2xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 animate-bounce flex items-center justify-center gap-2 cursor-pointer border border-amber-400/20"
                          >
                            <Play size={16} fill="currentColor" className="text-white" /> 開啟儀式獲得最終獎勵
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UltimateMedia imageUrl={config?.ultimate.image} videoUrl={config?.ultimate.video} forceUnmuted={true} />
                    )}
                  </div>
                </div>

                {/* 2. RESULT SUMMARY CONTAINER AREA - ONLY VISIBLE AFTER CEREMONY STARTS */}
                {hasBegunCeremony && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="space-y-8"
                  >
                    {(() => {
                      const stagesData = getStageSummaryData();
                      const matchedCats = getMatchedTeaCats(stagesData);

                      return (
                        <div id="result-summary-container" className="space-y-8 text-left max-w-md mx-auto pt-6 border-t border-stone-100">
                          {/* 1. 探測度 100% 標題（去除陰影，乾淨俐落） */}
                          <div className="text-center py-2 select-none">
                            <span 
                              style={{ textShadow: 'none' }}
                              className="text-lg md:text-xl font-extrabold tracking-widest text-[#B8860B] flex items-center justify-center gap-2"
                            >
                              <Sparkles size={20} className="text-[#B8860B] shrink-0" />
                              探測度已完成：100%
                            </span>
                          </div>

                          {/* A. 最終探索成果 */}
                          <div className="bg-white border border-stone-200/50 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col items-center text-center">
                            {/* 1. (Icon) 最終探索成果 */}
                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/10 text-amber-700 font-extrabold text-[11px] rounded-full uppercase tracking-widest shadow-xs">
                              👑 最終探索成果
                            </div>

                            {/* 2. 你最適合的茶品 */}
                            <h3 className="text-lg md:text-xl font-serif font-extrabold text-stone-800 tracking-wider">
                              你最適合的茶品
                            </h3>

                            {/* 3. 對應茶品的頭像 & 4. 對應茶品的名稱 */}
                            {matchedCats.length > 1 ? (
                              <div className="w-full space-y-4">
                                <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                                  {matchedCats.slice(0, 2).map((cat) => (
                                    <div key={cat.id} className="flex flex-col items-center">
                                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-stone-50 group mb-3">
                                        <img 
                                          src={cat.image} 
                                          alt={cat.name} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                          referrerPolicy="no-referrer" 
                                        />
                                      </div>
                                      <h4 className="text-sm font-extrabold text-[#707040] tracking-wide">
                                        {cat.name}
                                      </h4>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-4 w-full">
                                  {matchedCats.slice(0, 2).map(cat => {
                                    const details = teaSoulDetails[cat.id] || {
                                      tagline: '清新自然、與萬物契合的靈魂尋茶者',
                                      tags: ['熱愛自然', '和諧包容'],
                                      element: '大地自然元素',
                                      analysis: '您在尋茶之旅中展現出與自然和諧共處的深厚心靈特質。'
                                    };
                                    return (
                                      <div key={`desc-${cat.id}`} className="bg-stone-50/85 border border-stone-100 p-4 rounded-2xl text-xs text-stone-600 leading-relaxed font-light text-left space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-stone-800 text-xs border-b border-stone-200/50 pb-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#707040]"></span>
                                          {cat.name} · {details.tagline}
                                        </div>
                                        <div className="flex flex-wrap gap-1 pt-1">
                                          {details.tags.map(tag => (
                                            <span key={tag} className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              matchedCats.map(cat => {
                                const details = teaSoulDetails[cat.id] || {
                                  tagline: '清新自然、與萬物契合的靈魂尋茶者',
                                  tags: ['熱愛自然', '和諧包容'],
                                  element: '大地自然元素',
                                  analysis: '您在尋茶之旅中展現出與自然和諧共處的深厚心靈特質。您適合品嘗覓野茶精選的各式好茶，讓身心得到最極致的放鬆。'
                                };
                                return (
                                  <div key={cat.id} className="w-full space-y-4 flex flex-col items-center">
                                    {/* 3. 對應茶品的頭像 */}
                                    <div className="relative w-36 h-36 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-md bg-stone-100 group">
                                      <img 
                                        src={cat.image} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        referrerPolicy="no-referrer" 
                                      />
                                    </div>
                                    
                                    {/* 4. 對應茶品的名稱 */}
                                    <h4 className="text-lg font-bold text-stone-800 tracking-wide font-sans">
                                      {cat.name}
                                    </h4>

                                    <span className="text-xs text-amber-700 font-extrabold font-mono tracking-widest bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                      {details.element}
                                    </span>

                                    <div className="py-1">
                                      <p className="text-sm font-bold text-stone-700 font-serif italic">
                                        「{details.tagline}」
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-1.5 pb-1">
                                      {details.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* B. 新手村尋茶結果 */}
                          <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                              <span className="w-1.5 h-4 bg-[#707040] rounded-full inline-block"></span>
                              <h4 className="text-sm font-extrabold text-stone-800 tracking-wider">新手村尋茶結果</h4>
                            </div>

                            <div className="space-y-3">
                              {stagesData.map((stage) => {
                                let IconComponent = Heart;
                                let iconColor = 'text-rose-500';
                                if (stage.id === 'zodiac') { IconComponent = Sparkles; iconColor = 'text-amber-500'; }
                                else if (stage.id === 'energy') { IconComponent = Activity; iconColor = 'text-emerald-500'; }
                                else if (stage.id === 'lifestyle') { IconComponent = BookOpen; iconColor = 'text-indigo-500'; }
                                else if (stage.id === 'sensory') { IconComponent = Eye; iconColor = 'text-purple-500'; }

                                return (
                                  <div 
                                    key={stage.id} 
                                    className="bg-stone-50/50 border border-stone-200/40 rounded-2xl p-3 shadow-2xs flex items-center gap-3 text-left transition-all hover:bg-stone-50"
                                  >
                                    {/* (結果縮圖) */}
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-stone-100 shrink-0 shadow-xs">
                                      <img 
                                        src={stage.image} 
                                        alt={stage.title} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    
                                    {/* (測驗關卡) & (測驗結果) in single row */}
                                    <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                                      <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-[#707040] font-bold uppercase tracking-wider">
                                        <IconComponent size={12} className={iconColor} />
                                        <span>{stage.name}</span>
                                      </div>
                                      
                                      <h5 className="text-xs font-bold text-stone-800 truncate text-right max-w-[60%] leading-none">
                                        {stage.title}
                                      </h5>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {hasBegunCeremony && (
                  <>
                    {/* Download and Share components */}
                    <div className="space-y-4 max-w-md mx-auto pt-2 border-t border-stone-100">
                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-semibold text-stone-600 block">立即和朋友分享</p>
                    <div className="flex items-center justify-center gap-4">
                      {/* LINE */}
                      <button
                        onClick={() => triggerSocialShare('line', config?.ultimate.socialText || '')}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                        title="立即分享至 LINE"
                      >
                        {config?.share_icon_line ? (
                          <img src={config.share_icon_line} alt="LINE" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-[#06C755] flex items-center justify-center text-white hover:opacity-90">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738s-12 4.369-12 9.738c0 4.814 4.269 8.843 10.048 9.58 3.91 3.91 3.328 3.91 3.844 3.91.43 0 .741-.215.74-.537l-.02-1.921c1.554-1.229 3.018-2.617 4.175-4.253 2.1-.969 3.213-3.666 3.213-6.817zm-14.73 2.685h-1.636a.434.434 0 0 1-.435-.434V9.055a.434.434 0 0 1 .435-.434h1.636a.434.434 0 0 1 .434.434v.544a.434.434 0 0 1-.434.434h-.99v.762h.99a.434.434 0 0 1 .434.434v.545a.434.434 0 0 1-.434.434h-1.636a.435.435 0 0 1-.435-.434z" />
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Threads */}
                      <button
                        onClick={() => triggerSocialShare('threads', config?.ultimate.socialText || '')}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                        title="立即分享至 Threads"
                      >
                        {config?.share_icon_threads ? (
                          <img src={config.share_icon_threads} alt="Threads" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center text-white hover:bg-neutral-900">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.18 16.326c-.347.168-.619.26-.821.272a2.3 2.3 0 0 1-1.393-.418 2.32 2.3 0 0 1-.806-1.127l-.025-.09a5.92 5.92 0 0 1-2.915 1.545 4.316 4.316 0 0 1-2.316-.27c-.836-.37-1.468-1.002-1.89-1.89-.4-1.503.2-3.15 1.34-3.793.633-.356 1.332-.475 2.083-.35 1.258.204 2.115.82 2.628 1.838a1.27 1.27 0 0 0-.256-.032c-.89-.015-1.58.117-2.073.398l-.133.082c-.65.4-.533 1.492.35 1.411.373-.035.792-.128 1.077-.282.416-.226.745-.609.914-1.074l.03-.09c.307.391.688.583 1.155.583a1.53 1.53 0 0 0 .977-.354l.061-.059v1.233c-.021.24.032.483.2.71c.101.144.204.225.321.244.282-.008.618-.114 1-.318l1.455-1.353c1.696-1.583.947-3.655-.951-4.269a6.012 6.012 0 0 0-4.045-.04c-1.848.601-3.155 2.128-3.418 3.992-.259 1.833.618 3.738 2.215 4.792a7.02 7.02 0 0 0 4.12 1.268c1.378-.01.21-.122.951-.107c1.252-.423 2.155-1.351 2.766-2.825l-.233-.082c-.394.887-1.121 1.442-2.185 1.666zm-5.011-3.666c-.347.012-.663.094-.949.246-.575.308-.475 1.085.18 1.12.35-.008.625-.133.821-.375a1.86 1.86 0 0 0 .378-1l-.43.009z" />
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Instagram */}
                      <button
                        onClick={() => triggerSocialShare('instagram', config?.ultimate.socialText || '')}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                        title="立即分享至 Instagram"
                      >
                        {config?.share_icon_instagram ? (
                          <img src={config.share_icon_instagram} alt="Instagram" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-[#E4405F]/90 bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white flex items-center justify-center hover:opacity-100">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Facebook */}
                      <button
                        onClick={() => triggerSocialShare('facebook', config?.ultimate.socialText || '')}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                        title="立即分享至 Facebook"
                      >
                        {config?.share_icon_facebook ? (
                          <img src={config.share_icon_facebook} alt="Facebook" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#1565D8]">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* 一鍵複製連結 */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('https://meandtea.vercel.app/beginner-village').then(() => {
                            toast.success('連結已複製！');
                          }).catch(() => {
                            toast.error('複製失敗，請手動複製');
                          });
                        }}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm bg-[#707040] hover:bg-[#5c5c34] text-white shrink-0"
                        title="複製分享連結"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                    {/* LINE 引流橫幅 */}
                    {config?.line_banner_url && config?.line_official_link && (
                      <div className="w-full mt-6 flex justify-center">
                        <a 
                          href={config.line_official_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full max-w-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <img 
                            src={resolveMapBackgroundUrl(config.line_banner_url)} 
                            alt="加入覓野茶LINE官方帳號" 
                            className="w-full h-auto rounded-2xl shadow-sm object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </a>
                      </div>
                    )}

                    {/* 通用通知 */}
                    <div className="mt-4 p-4 bg-[#707040]/5 rounded-2xl border border-[#707040]/10 text-center max-w-md mx-auto">
                      <p className="text-stone-700 text-xs md:text-sm font-semibold leading-relaxed">
                        加入 LINE 官方帳號，輸入 <span className="text-[#707040] font-extrabold font-serif">【覓野茶】</span>，即可領取首購免運券
                      </p>
                    </div>

                    {/* 畢業禮機制 結業獎勵卡 (測驗完成數達 5 個時額外渲染) */}
                    {completedStages.length >= 5 && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-[#FAF7F2] to-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#707040]/30 shadow-sm relative overflow-hidden max-w-md mx-auto text-left animate-fadeIn">
                        <div className="relative flex items-center gap-4">
                          <div className="bg-[#707040]/5 rounded-2xl border border-[#707040]/10 text-[#707040] shrink-0 flex items-center justify-center w-14 h-14 overflow-hidden">
                            {config?.graduation_icon_url ? (
                              <img src={config.graduation_icon_url} alt="graduation icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <Award size={26} strokeWidth={1.2} className="animate-pulse" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1 pr-2">
                            <h4 className="text-[10px] font-bold tracking-widest text-[#707040]/70 uppercase">
                              {config?.graduation_tag || 'VILLAGE GRADUATION REWARD'}
                            </h4>
                            <p className="text-stone-800 text-xs md:text-sm font-bold leading-normal">
                              {config?.graduation_title || '恭喜你完成了新手村所有的任務！'}
                            </p>
                            <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-line">
                              {config?.graduation_text ? renderFormattedText(config.graduation_text) : (
                                <>
                                  加入 LINE 官方帳號，輸入 <span className="text-[#707040] font-bold">【新手村折價券】</span>，即可領取 <span className="text-amber-700 font-bold font-serif">【滿 500 折 50】</span>折價券
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {hasBegunCeremony && (
                <div className="pt-6 border-t border-stone-100 flex flex-col items-center gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('確定要清除所有進度並重新開始測驗嗎？')) {
                        handleRestartAll();
                      }
                    }}
                    className="w-full max-w-xs bg-[#707040] hover:bg-[#5a5a31] text-white py-3 px-6 rounded-xl text-xs font-bold tracking-widest transition-all shadow-sm active:scale-97 flex items-center justify-center gap-2 uppercase"
                  >
                    重新開始測驗 (Restart)
                  </button>
                  <button
                    onClick={() => setShowUltimateScreen(false)}
                    className="text-stone-500 hover:text-stone-800 text-xs font-semibold underline underline-offset-4 tracking-wider"
                  >
                    返回新手村探索地圖
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeStageId ? (
            
            /* 2. SPECIFIC STAGE EXPERIENCE PATH */
            <motion.div
              key="stage-interactive"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 relative text-left"
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform, opacity'
              }}
            >
              {/* Back button */}
              <button
                onClick={handleBackToVillage}
                className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 transition p-1.5 rounded-full hover:bg-stone-50"
              >
                <X size={18} />
              </button>

              <div className="mb-6 pb-4 border-b border-stone-100 text-left">
                <span className="text-[10px] font-bold tracking-wider text-[#707040] font-mono block uppercase">
                  VILLAGE EXPLORATION
                </span>
                <h2 className="text-xl font-bold text-stone-800 font-sans tracking-wide mt-0.5">
                  {currentStage?.name}
                </h2>
              </div>

              {/* A. If stage is ALREADY completed & showing final design card results */}
              {stageResult ? (
                <div className="space-y-6 text-center">
                  {/* ① 頂部小標 */}
                  <div className="text-center space-y-1 mb-4">
                    <span className="text-xs font-extrabold text-[#707040] bg-[#707040]/10 tracking-widest px-4 py-1.5 rounded-full inline-block">
                      ✦ 探索任務完成！ ✦
                    </span>
                  </div>

                  {/* ② 主視覺圖卡 */}
                  <div 
                    className="relative group max-w-[450px] mx-auto aspect-[9/16] bg-transparent pointer-events-none select-none touch-none shadow-lg"
                    style={{
                      borderRadius: '2rem',
                      willChange: 'transform',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      isolation: 'isolate',
                    }}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                  >
                    <div
                      className="absolute inset-0 w-full h-full overflow-hidden bg-transparent"
                      style={{
                        borderRadius: '2rem',
                        border: '0px',
                        outline: 'none',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        isolation: 'isolate',
                      }}
                    >
                      <img
                        src={stageResult.image}
                        alt={stageResult.title}
                        className="w-full h-full object-cover pointer-events-none select-none touch-none"
                        style={{
                          borderRadius: '2rem',
                          willChange: 'transform',
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                        referrerPolicy="no-referrer"
                        draggable="false"
                        onContextMenu={(e) => { e.preventDefault(); return false; }}
                      />
                    </div>
                  </div>

                  {/* ③ 結果詳細文案 */}
                  <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-[2rem] p-10 md:p-12 shadow-md border border-stone-100 flex flex-col items-center justify-center text-center">
                    {/* 獨立標籤 1：測驗主題（必須是精緻小字，顏色調淡） */}
                    <span 
                      style={{ fontSize: '14px', color: '#8c8a87', letterSpacing: '0.1em', fontWeight: '400', display: 'block', marginBottom: '12px' }}
                    >
                      — 新手村探索結果 —
                    </span>

                    {/* 獨立標籤 2：測驗結果大標題（必須極大、極粗、深黑，成為絕對焦點！） */}
                    <h2 
                      style={{ fontSize: '32px', color: '#1c1917', fontWeight: '900', marginBottom: '24px', textAlign: 'center', lineHeight: '1.3', display: 'block' }}
                    >
                      {stageResult.title}
                    </h2>
                    
                    {/* 視覺裝飾分割線 */}
                    <div className="w-16 h-[2px] bg-stone-200 mb-6"></div>

                    {/* 獨立標籤 3：特質描述描述（標準品讀字體，舒適行高） */}
                    {stageResult.description && (
                      <p 
                        style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.8', textAlign: 'center', whiteSpace: 'pre-line', fontWeight: '400', width: '100%' }}
                      >
                        {stageResult.description}
                      </p>
                    )}
                  </div>

                  {/* ④ 立即與朋友分享 */}
                  <div className="max-w-sm mx-auto space-y-4 text-center">
                    <div className="pt-2 space-y-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#707040] block">立即和朋友分享</p>
                      
                      <div className="flex items-center justify-center gap-4">
                        {/* LINE */}
                        <button
                          onClick={() => triggerSocialShare('line', stageResult.socialText || '')}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                          title="立即分享至 LINE"
                        >
                          {config?.share_icon_line ? (
                            <img src={config.share_icon_line} alt="LINE" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-[#06C755] flex items-center justify-center text-white hover:opacity-90">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738s-12 4.369-12 9.738c0 4.814 4.269 8.843 10.048 9.58 3.91 3.91 3.328 3.91 3.844 3.91.43 0 .741-.215.74-.537l-.02-1.921c1.554-1.229 3.018-2.617 4.175-4.253 2.1-.969 3.213-3.666 3.213-6.817zm-14.73 2.685h-1.636a.434.434 0 0 1-.435-.434V9.055a.434.434 0 0 1 .435-.434h1.636a.434.434 0 0 1 .434.434v.544a.434.434 0 0 1-.434.434h-.99v.762h.99a.434.434 0 0 1 .434.434v.545a.434.434 0 0 1-.434.434h-1.636a.435.435 0 0 1-.435-.434z" />
                              </svg>
                            </div>
                          )}
                        </button>

                        {/* Threads */}
                        <button
                          onClick={() => triggerSocialShare('threads', stageResult.socialText || '')}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                          title="立即分享至 Threads"
                        >
                          {config?.share_icon_threads ? (
                            <img src={config.share_icon_threads} alt="Threads" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center text-white hover:bg-neutral-900">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.18 16.326c-.347.168-.619.26-.821.272a2.3 2.3 0 0 1-1.393-.418 2.32 2.3 0 0 1-.806-1.127l-.025-.09a5.92 5.92 0 0 1-2.915 1.545 4.316 4.316 0 0 1-2.316-.27c-.836-.37-1.468-1.002-1.89-1.89-.4-1.503.2-3.15 1.34-3.793.633-.356 1.332-.475 2.083-.35 1.258.204 2.115.82 2.628 1.838a1.27 1.27 0 0 0-.256-.032c-.89-.015-1.58.117-2.073.398l-.133.082c-.65.4-.533 1.492.35 1.411.373-.035.792-.128 1.077-.282.416-.226.745-.609.914-1.074l.03-.09c.307.391.688.583 1.155.583a1.53 1.53 0 0 0 .977-.354l.061-.059v1.233c-.021.24.032.483.2.71c.101.144.204.225.321.244.282-.008.618-.114 1-.318l1.455-1.353c1.696-1.583.947-3.655-.951-4.269a6.012 6.012 0 0 0-4.045-.04c-1.848.601-3.155 2.128-3.418 3.992-.259 1.833.618 3.738 2.215 4.792a7.02 7.02 0 0 0 4.12 1.268c1.378-.01.21-.122.951-.107c1.252-.423 2.155-1.351 2.766-2.825l-.233-.082c-.394.887-1.121 1.442-2.185 1.666zm-5.011-3.666c-.347.012-.663.094-.949.246-.575.308-.475 1.085.18 1.12.35-.008.625-.133.821-.375a1.86 1.86 0 0 0 .378-1l-.43.009z" />
                              </svg>
                            </div>
                          )}
                        </button>

                        {/* Instagram */}
                        <button
                          onClick={() => triggerSocialShare('instagram', stageResult.socialText || '')}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                          title="立即分享至 Instagram"
                        >
                          {config?.share_icon_instagram ? (
                            <img src={config.share_icon_instagram} alt="Instagram" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-[#E4405F]/90 bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white flex items-center justify-center hover:opacity-100">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                              </svg>
                            </div>
                          )}
                        </button>

                        {/* Facebook */}
                        <button
                          onClick={() => triggerSocialShare('facebook', stageResult.socialText || '')}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm overflow-hidden bg-transparent shrink-0"
                          title="立即分享至 Facebook"
                        >
                          {config?.share_icon_facebook ? (
                            <img src={config.share_icon_facebook} alt="Facebook" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#1565D8]">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </div>
                          )}
                        </button>

                        {/* 一鍵複製連結 */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('https://meandtea.vercel.app/beginner-village').then(() => {
                              toast.success('連結已複製！');
                            }).catch(() => {
                              toast.error('複製失敗，請手動複製');
                            });
                          }}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all scale-100 active:scale-95 shadow-sm bg-[#707040] hover:bg-[#5c5c34] text-white shrink-0"
                          title="複製分享連結"
                        >
                          <Copy size={18} />
                        </button>
                      </div>

                      {/* LINE 引流橫幅 */}
                      {config?.line_banner_url && config?.line_official_link && (
                        <div className="w-full mt-6 flex justify-center">
                          <a 
                            href={config.line_official_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full max-w-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <img 
                              src={resolveMapBackgroundUrl(config.line_banner_url)} 
                              alt="加入覓野茶LINE官方帳號" 
                              className="w-full h-auto rounded-2xl shadow-sm object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        </div>
                      )}

                      {/* 通用通知 */}
                      <div className="mt-4 p-4 bg-[#707040]/5 rounded-2xl border border-[#707040]/10 text-center max-w-md mx-auto">
                        <p className="text-stone-700 text-xs md:text-sm font-semibold leading-relaxed">
                          加入 LINE 官方帳號，輸入 <span className="text-[#707040] font-extrabold font-serif">【覓野茶】</span>，即可領取首購免運券
                        </p>
                      </div>

                      {/* 畢業禮機制 結業獎勵卡 (測驗完成數達 5 個時額外渲染) */}
                      {completedStages.length >= 5 && (
                        <div className="mt-4 p-5 bg-gradient-to-br from-[#FAF7F2] to-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#707040]/30 shadow-sm relative overflow-hidden max-w-md mx-auto text-left animate-fadeIn">
                          <div className="relative flex items-center gap-4">
                            <div className="bg-[#707040]/5 rounded-2xl border border-[#707040]/10 text-[#707040] shrink-0 flex items-center justify-center w-14 h-14 overflow-hidden">
                              {config?.graduation_icon_url ? (
                                <img src={config.graduation_icon_url} alt="graduation icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Award size={26} strokeWidth={1.2} className="animate-pulse" />
                              )}
                            </div>
                            <div className="space-y-1 flex-1 pr-2">
                              <h4 className="text-[10px] font-bold tracking-widest text-[#707040]/70 uppercase">
                                {config?.graduation_tag || 'VILLAGE GRADUATION REWARD'}
                              </h4>
                              <p className="text-stone-800 text-xs md:text-sm font-bold leading-normal">
                                {config?.graduation_title || '恭喜你完成了新手村所有的任務！'}
                              </p>
                              <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-line">
                                {config?.graduation_text ? renderFormattedText(config.graduation_text) : (
                                  <>
                                    加入 LINE 官方帳號，輸入 <span className="text-[#707040] font-bold">【新手村折價券】</span>，即可領取 <span className="text-amber-700 font-bold font-serif">【滿 500 折 50】</span>折價券
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100">
                    <button
                      onClick={handleBackToVillage}
                      className="text-[#707040] hover:underline text-xs font-bold tracking-wider"
                    >
                      返回新手村探索地圖 ➔
                    </button>
                  </div>
                </div>
              ) : inIntroScreen ? (
                /* B. 新手步道第一里路：過場說明前導故事畫面 */
                <div className="space-y-6 md:space-y-8 animate-fadeIn">
                  {/* 上半部：質感大片故事宣傳圖 */}
                  <div 
                    className="rounded-2xl overflow-hidden bg-[#F9F8F4] bg-stone-50 relative group animate-fadeIn"
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translate3d(0, 0, 0)'
                    }}
                  >
                    <img
                      src={currentStage?.introImage || 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=85'}
                      alt={currentStage?.name || '關卡故事前導圖'}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-102"
                      style={{
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translate3d(0, 0, 0)',
                        willChange: 'transform'
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* 下半部：留出優雅的閱讀空間，呈現前導引言故事與玩法說明 */}
                  <div className="max-w-xl mx-auto py-2">
                    <div className="text-stone-700 text-sm md:text-base font-medium leading-loose tracking-widest text-center whitespace-pre-line antialiased px-3 font-sans">
                      {currentStage?.introText || '有一股神秘的自然香氣正在林道間徐徐飄送...\n點擊下方按鈕，即刻啟程一探究竟！'}
                    </div>
                  </div>

                  {/* 質感引導按鈕：踏上尋茶之旅 / 開始探索 */}
                  <div className="pt-6 border-t border-stone-100 flex flex-col items-center gap-4">
                    <motion.button
                      whileHover={userCompletedAllLevels ? {} : { scale: 1.02 }}
                      whileTap={userCompletedAllLevels ? {} : { scale: 0.98 }}
                      onClick={() => setInIntroScreen(false)}
                      disabled={userCompletedAllLevels}
                      className="w-full max-w-sm bg-[#707040] hover:bg-[#5a5a31] text-white py-4 px-8 rounded-2xl text-xs md:text-sm font-extrabold tracking-widest transition-all shadow-md active:scale-97 flex items-center justify-center gap-2 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#707040]"
                    >
                      開始探索 <ChevronRight size={16} />
                    </motion.button>
                    
                    <button
                      onClick={handleBackToVillage}
                      className="text-stone-400 hover:text-stone-600 text-xs tracking-wider font-semibold underline underline-offset-4 transition"
                    >
                      暫停探索，返回地圖
                    </button>
                  </div>
                </div>
              ) : activeStageId === 'zodiac' ? (
                
                /* B. ZODIAC SPECIFIC INTERACTIVE SELECTION */
                <div className="space-y-6">
                  <p className="text-xs text-stone-500 leading-normal mb-2">
                    漫遊在璀璨的星野下方，點選你（或你所愛的人）的本命星座，探尋宇宙與覓野高山茶的深刻召喚：
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {listZodiacs.map(zodiac => (
                      <button
                        key={zodiac}
                        disabled={userCompletedAllLevels}
                        onClick={() => handleZodiacSelect(zodiac)}
                        className="bg-stone-50 hover:bg-[#707040] hover:text-white border border-stone-200/60 hover:border-[#707040] rounded-xl text-center py-3.5 transition-all text-sm font-medium tracking-wide active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-50 disabled:hover:text-stone-800"
                      >
                        {zodiac}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                    <button
                      onClick={handleBackToVillage}
                      className="text-stone-400 hover:text-stone-600 text-xs tracking-wider font-semibold underline underline-offset-4"
                    >
                      暫停探索，返回地圖
                    </button>
                  </div>
                </div>
              ) : (
                
                /* C. STANDARD QUIZ OPTION SELECT BLOCK */
                <div className="space-y-8">
                  {currentStage && currentStage.questions.length > 0 && (
                    <div>
                      {/* Question Text */}
                      <div className="space-y-2 mb-6 text-left">
                        <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2.5 py-1 rounded-full font-mono">
                          QUESTION {currentQuestionIndex + 1} / {currentStage.questions.length}
                        </span>
                        <h3 
                          className="text-xl md:text-2xl font-bold tracking-wide font-sans"
                          style={{ fontSize: '22px', color: '#1c1917', fontWeight: '700', lineHeight: '1.4', paddingTop: '8px' }}
                        >
                          {currentStage.questions[currentQuestionIndex].text}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {currentStage.questions[currentQuestionIndex].options.map((option, index) => (
                          <button
                            key={option.id}
                            disabled={userCompletedAllLevels}
                            onClick={() => handleAnswerSubmit(
                              option.score, 
                              currentStage.questions[currentQuestionIndex].id, 
                              option.id
                            )}
                            className="w-full text-left bg-stone-50/70 hover:bg-[#707040] hover:text-white border border-stone-200/50 hover:border-[#707040] rounded-2xl p-4 md:p-5 transition-all duration-200 shadow-sm flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-50/70 disabled:hover:text-stone-800"
                          >
                            <span className="text-sm md:text-base font-semibold tracking-wide pr-4 leading-relaxed transition-colors">
                              {String.fromCharCode(65 + index)}. {option.text}
                            </span>
                            <ChevronRight size={14} className="text-stone-400 group-hover:text-white shrink-0 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 text-center">
                    <button
                      onClick={handleBackToVillage}
                      className="text-stone-400 hover:text-stone-600 text-xs tracking-wider font-semibold underline underline-offset-4"
                    >
                      暫停探索，返回地圖
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            
            /* 3. OPEN VILLAGE DECENTRALIZED EXPLORATION MAP (MAIN STATE) */
            <motion.div
              key="map-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#707040] bg-[#707040]/5 uppercase px-3 py-1 rounded-full font-serif border border-[#707040]/10 mb-6">
                  <Compass size={12} className="animate-spin" /> DISCOVERY VOYAGE
                </span>
                <h1 className="text-4xl md:text-5xl font-serif italic text-zen-wood mb-6">
                  「覓野茶」尋茶新手村
                </h1>
                <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">
                  {config?.map_subtitle || '拋棄生硬呆板的線性答卷！這是一場開放式村落地圖探索。不設順序，唯有心靈所及。自由解碼五維尋茶基因獲得終極大獎、精緻圖卡和限額驚喜優惠！'}
                </p>

                {completedStages.length > 0 && (
                  <div className="max-w-md mx-auto pt-3 space-y-4">
                    <div className="flex items-center justify-center gap-4 text-center">
                      {completedStages.length === 5 ? (
                        <motion.span
                          animate={{ 
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          style={{ textShadow: 'none' }}
                          className="text-lg md:text-xl font-extrabold tracking-widest text-[#B8860B] flex items-center justify-center gap-2"
                        >
                          <Sparkles size={20} className="text-[#B8860B] shrink-0 animate-bounce" />
                          探測度已完成：100%
                        </motion.span>
                      ) : (
                        <span className="text-xs font-semibold tracking-wider text-stone-600">
                          探測度已完成：{completedStages.length * 20}%
                        </span>
                      )}
                    </div>
                    
                    {/* 動態填滿進度條元件 */}
                    <div className="grid grid-cols-5 gap-2 w-full">
                      {[0, 1, 2, 3, 4].map((i) => {
                        const isFilled = completedStages.length > i;
                        return (
                          <div key={i} className="relative h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/40 shadow-inner">
                            <motion.div
                              initial={false}
                              animate={{ width: isFilled ? '100%' : '0%' }}
                              transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.05 }}
                              className={`${completedStages.length === 5 ? 'bg-gradient-to-r from-[#707040] to-[#D4AF37]' : 'bg-[#707040]'} h-full rounded-full shadow-sm`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* 重新開始按鈕：放在進度條的正下方，寬度與進度條等寬 */}
                    <div className="pt-2 w-full">
                      {!showResetConfirm ? (
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="w-full text-center border-2 border-[#707040]/30 hover:border-[#707040] text-stone-600 hover:text-[#707040] px-4 py-2.5 rounded-xl transition-all font-bold text-xs bg-stone-50/50 hover:bg-[#707040]/5 tracking-widest shadow-sm flex items-center justify-center gap-2 uppercase"
                        >
                          <Compass size={14} className="shrink-0" />
                          重新開始測驗 (Restart)
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2 bg-amber-50/80 border border-amber-200 p-3 rounded-xl w-full">
                          <span className="text-xs text-amber-800 font-bold">確認清除所有前台作答進度？</span>
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={handleRestartAll}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg font-bold text-xs transition-all shadow-sm"
                            >
                              確定重置
                            </button>
                            <button
                              onClick={() => setShowResetConfirm(false)}
                              className="flex-1 bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 py-1.5 px-3 rounded-lg font-medium text-xs transition-all shadow-sm"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MAP VISUAL CONTAINER - Borderless and transparent to blend fully with the main background */}
              <div className="relative w-full max-w-4xl mx-auto p-4 md:p-0">
                {/* Nodes rendering - Custom symmetric-gap fluid grid with no absolute positioning to prevent overlap */}
                <div className="w-full h-auto min-h-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 md:gap-12">
                  {mapNodes.map((node) => {
                    const isCompleted = completedStages.includes(node.id);
                    const bgImage = 
                      node.id === 'personality' ? config?.map_bg_personality :
                      node.id === 'zodiac' ? config?.map_bg_zodiac :
                      node.id === 'energy' ? config?.map_bg_energy :
                      node.id === 'lifestyle' ? config?.map_bg_lifestyle :
                      node.id === 'sensory' ? config?.map_bg_sensory : undefined;
                    
                    const hasBgImage = bgImage && bgImage.trim() !== '';
                    const isPersonality = node.id === 'personality';

                    return (
                      <div 
                        key={node.id} 
                        className={`w-full ${isPersonality ? "sm:col-span-2 flex justify-center" : ""}`}
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStageClick(node.id)}
                          className={`
                            aspect-[4/3] rounded-3xl text-left transition-all duration-300
                            flex flex-col justify-between items-start gap-2 cursor-pointer relative overflow-hidden
                            ${isPersonality ? 'w-full sm:max-w-md' : 'w-full'}
                            ${hasBgImage ? 'border-0 bg-transparent shadow-none' : `${node.bg} shadow-md`}
                          `}
                          style={{
                            willChange: 'transform',
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                        >
                          {hasBgImage ? (
                            <img 
                              src={bgImage} 
                              alt={node.name} 
                              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none rounded-3xl select-none"
                              style={{
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                              }}
                            />
                          ) : (
                            <div className="relative z-10 space-y-1.5 text-left w-full h-full flex flex-col justify-between p-5 pr-10">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between w-full gap-2">
                                  {node.tag ? (
                                    <span className="text-[8px] bg-[#E39B24] text-white px-1.5 py-0.5 font-bold rounded shrink-0">
                                      {node.tag}
                                    </span>
                                  ) : <div />}
                                  {isCompleted && (
                                    <span className="text-[10px] text-emerald-500 bg-emerald-50/95 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                      <CheckCircle2 size={10} /> 已通關
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-bold tracking-wide leading-none">{node.name}</h3>
                              </div>
                              <p className="text-[10px] line-clamp-2 leading-relaxed opacity-85 text-stone-500">
                                {node.desc}
                              </p>
                            </div>
                          )}

                          {/* Visual entry button */}
                          <div className={`
                            absolute bottom-5 right-5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 z-10
                            ${hasBgImage || isPersonality ? 'bg-white/25 hover:bg-white/40 text-white backdrop-blur-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}
                          `}>
                            <ChevronRight size={14} />
                          </div>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompt showing how to get the dossier */}
              <div className={`max-w-md mx-auto p-5 rounded-2xl border text-left transition-all duration-300 ${
                hasMapBg 
                  ? 'bg-white/70 backdrop-blur-md border-white/30 shadow-sm' 
                  : 'bg-stone-100/60 border-stone-200/40'
              }`}>
                {/* 增加百分比動態數值 */}
                <div className="flex items-center justify-between text-xs font-bold mb-2 text-[#707040]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#707040] animate-pulse" />
                    目前進度：{completedStages.length * 20}%
                  </span>
                  <span className="text-stone-500 text-[11px]">已完成 {completedStages.length}/5 關卡</span>
                </div>

                {/* 進度條結構轉型（刻度化）：5等分刻度設計 */}
                <div className="grid grid-cols-5 gap-2 my-2.5">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const isFilled = completedStages.length > i;
                    return (
                      <div key={i} className="relative h-2.5 bg-stone-200/60 rounded-full overflow-hidden border border-stone-300/10 shadow-inner">
                        <motion.div
                          initial={false}
                          animate={{ width: isFilled ? '100%' : '0%' }}
                          transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.05 }}
                          className="bg-[#707040] h-full rounded-full shadow-sm"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 動態提示語句邏輯 */}
                <div className="mt-3 flex items-start gap-2">
                  <Sparkles size={14} className="text-[#E39B24] shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs text-stone-700 leading-relaxed font-bold">
                    {completedStages.length === 4 ? (
                      "再完成最後 1 關，立即解鎖終極五維檔案與專屬優惠！"
                    ) : completedStages.length === 5 ? (
                      "恭喜通關！終極五維檔案與專屬優惠已解鎖！"
                    ) : (
                      `加油，還差 ${5 - completedStages.length} 關即可解鎖終極大獎`
                    )}
                  </p>
                </div>

                {completedStages.length >= 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowUltimateScreen(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-md animate-pulse active:scale-98"
                    >
                      <Award size={14} /> 前往領取我的終極五維尋茶檔案
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. SINGLE STAGE REVIEW MODAL POPUP */}
      <AnimatePresence>
        {selectedReviewStageId && (() => {
          const stagesData = getStageSummaryData();
          const stage = stagesData.find(s => s.id === selectedReviewStageId);
          if (!stage) return null;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                onClick={() => setSelectedReviewStageId(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FCFAF7] border border-stone-200/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-[#707040] animate-pulse" size={18} />
                    <h3 className="text-base font-bold text-stone-800">{stage.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedReviewStageId(null)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#707040]/10 text-[#707040] px-2.5 py-1 font-bold rounded-full uppercase tracking-wider">
                    {stage.name}
                  </span>
                  
                  <div className="w-48 h-48 mx-auto rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/50 shadow-md">
                    <img 
                      src={stage.image} 
                      alt={stage.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-stone-800 font-serif leading-snug">
                      {stage.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light px-2 whitespace-pre-line">
                      {stage.description}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 bg-stone-50 border-t border-stone-100 text-center shrink-0">
                  <button
                    onClick={() => setSelectedReviewStageId(null)}
                    className="w-full py-2.5 px-4 bg-[#707040] hover:bg-[#5c5c34] text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    關閉回顧，繼續探索 🍵
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
