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
          loop
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
    name: '文青炭香黑貓',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&h=600&q=80',
    description: '愛好靜謐與深度思考，最愛在微雨的午後泡一杯暖和的深焙黑茶，享受安靜的閱讀與白噪音時光。',
    personalityTrait: '深沉冷靜、善於傾聽與觀照內心'
  },
  {
    id: 'spring_water_cat',
    name: '柔韻清泉水貓',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&h=600&q=80',
    description: '情感細膩溫柔，如清晨流經山石的澄澈清泉。喜愛在潺潺溪畔放鬆，與甘甜的冷泡綠茶有著天生的絕佳默契。',
    personalityTrait: '溫柔體貼、感知細膩與喜愛和諧'
  },
  {
    id: 'orange_cat',
    name: '優雅微風橘貓',
    image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=600&h=600&q=80',
    description: '品位高雅，熱愛山居生活美學與品茗儀式感。在茶香與精緻器皿間體悟微小的幸福，最愛香氣高雅、如風般輕盈的野放白茶。',
    personalityTrait: '優雅從容、注重生活儀式感與美學'
  },
  {
    id: 'tabby_cat',
    name: '活力暖陽小虎',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&h=600&q=80',
    description: '熱情奔放，渾身充滿山野生命的元力！喜歡親近自然，與同伴分享喜悅，最契合厚實飽滿、烘焙甘甜的原生焙火烏龍。',
    personalityTrait: '開朗樂觀、精力充沛與富有冒險精神'
  },
  {
    id: 'calico_cat',
    name: '靈性山野小花',
    image: 'https://images.unsplash.com/photo-1513360309081-36f5e878fc11?auto=format&fit=crop&w=600&h=600&q=80',
    description: '與大自然有著極深的靈性共鳴，是山林最忠實的守護者。聽得懂微風與落葉的對話，最懂得品鑑稀有奇特的台灣野生野放茶。',
    personalityTrait: '靈性敏銳、與自然合一與熱愛探索'
  }
];

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
        return {
          id: def.id,
          name: def.name,
          title: saved.title || def.title,
          image: saved.image || def.image,
          score: saved.score !== undefined ? saved.score : def.score,
          description: saved.description || def.description
        };
      }
      return def;
    });
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
      if (stage.id === 'personality') {
        if (score <= 3) votes.black_cat += 1;
        else if (score <= 5) votes.spring_water_cat += 1;
        else if (score <= 7) votes.orange_cat += 1;
        else if (score <= 9) votes.tabby_cat += 1;
        else votes.calico_cat += 1;
      } else if (stage.id === 'zodiac') {
        const title = stage.title || '';
        if (title.includes('火') || title.includes('牡羊') || title.includes('獅子') || title.includes('射手') || title.includes('烈焰')) {
          votes.tabby_cat += 1;
        } else if (title.includes('水') || title.includes('雙魚') || title.includes('巨蟹') || title.includes('天蠍') || title.includes('清泉')) {
          votes.spring_water_cat += 1;
        } else if (title.includes('土') || title.includes('金牛') || title.includes('處女') || title.includes('摩羯') || title.includes('炭香')) {
          votes.black_cat += 1;
        } else if (title.includes('風') || title.includes('雙子') || title.includes('天秤') || title.includes('水瓶') || title.includes('微風')) {
          votes.orange_cat += 1;
        } else {
          votes.calico_cat += 1;
        }
      } else if (stage.id === 'energy') {
        if (score <= 2) votes.black_cat += 1;
        else if (score <= 4) votes.spring_water_cat += 1;
        else if (score <= 6) votes.orange_cat += 1;
        else if (score <= 8) votes.tabby_cat += 1;
        else votes.calico_cat += 1;
      } else if (stage.id === 'lifestyle') {
        if (score <= 2) votes.black_cat += 1;
        else if (score <= 4) votes.spring_water_cat += 1;
        else if (score <= 6) votes.orange_cat += 1;
        else if (score <= 8) votes.tabby_cat += 1;
        else votes.calico_cat += 1;
      } else if (stage.id === 'sensory') {
        if (score <= 2) votes.black_cat += 1;
        else if (score <= 4) votes.spring_water_cat += 1;
        else if (score <= 6) votes.orange_cat += 1;
        else if (score <= 8) votes.tabby_cat += 1;
        else votes.calico_cat += 1;
      }
    });

    let maxVotes = 0;
    Object.values(votes).forEach(v => {
      if (v > maxVotes) maxVotes = v;
    });

    if (maxVotes === 0) {
      return [TEA_CAT_TYPES[0]];
    }

    const matchedKeys = Object.keys(votes).filter(k => votes[k] === maxVotes);
    return matchedKeys.map(key => TEA_CAT_TYPES.find(c => c.id === key)!).filter(Boolean);
  };

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<BeginnerVillageConfig | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [userCompletedAllLevels, setUserCompletedAllLevels] = useState<boolean>(false);
  
  // Quiz specific states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [runningScore, setRunningScore] = useState(0);
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  
  // Result screen active states
  const [stageResult, setStageResult] = useState<{
    stageId: string;
    title: string;
    image: string;
    socialText: string;
    description?: string;
  } | null>(null);

  // Ultimate Completion Screen State
  const [showUltimateScreen, setShowUltimateScreen] = useState(false);
  const [hasBegunCeremony, setHasBegunCeremony] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [inIntroScreen, setInIntroScreen] = useState(false);

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

  useEffect(() => {
    if (showUltimateScreen) {
      setHasBegunCeremony(false);
    }
  }, [showUltimateScreen]);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Fetch config
    const loadConfig = async () => {
      try {
        const data = await getVillageConfig();
        setConfig(data);
      } catch (err) {
        toast.error('讀取新手村設定失敗');
      } finally {
        setLoading(false);
      }
    };

    // Load user_completed_all_levels
    const completedAll = localStorage.getItem('user_completed_all_levels') === 'true';
    if (completedAll) {
      setUserCompletedAllLevels(true);
      setShowUltimateScreen(true);
    }

    // Load progress from localStorage
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

    loadConfig();
  }, []);

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
      if (!completedStages.includes(activeStageId)) {
        const updated = [...completedStages, activeStageId];
        setCompletedStages(updated);
        localStorage.setItem('miye_village_completed', JSON.stringify(updated));
      }
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
    if (!completedStages.includes('zodiac')) {
      const updated = [...completedStages, 'zodiac'];
      setCompletedStages(updated);
      localStorage.setItem('miye_village_completed', JSON.stringify(updated));
    }
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
                  onClick={() => setShowUltimateScreen(false)}
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
                            <Play size={16} fill="currentColor" className="text-white" /> 進入開啟儀式
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UltimateMedia imageUrl={config?.ultimate.image} videoUrl={config?.ultimate.video} forceUnmuted={true} />
                    )}
                  </div>
                </div>

                {/* 2. RESULT SUMMARY CONTAINER AREA */}
                {(() => {
                  const stagesData = getStageSummaryData();
                  const matchedCats = getMatchedTeaCats(stagesData);
                  const catNamesStr = matchedCats.map(c => c.name).join(' 和 ');

                  return (
                    <div id="result-summary-container" className="space-y-6 text-left max-w-md mx-auto pt-6 border-t border-stone-100">
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

                      {/* 2. 尋茶結果（您最適合的茶品 -> [貓名稱]） */}
                      <div className="text-center py-5 border-y border-stone-100 my-2 space-y-3">
                        <h4 className="text-stone-500 font-sans text-xs font-semibold tracking-wider">
                          您最適合的茶品
                        </h4>
                        
                        <div className="flex justify-center gap-4 py-1.5">
                          {matchedCats.map(cat => (
                            <div key={cat.id} className="relative w-16 h-16 rounded-full overflow-hidden border border-stone-200 shadow-xs shrink-0">
                              <img 
                                src={cat.image} 
                                alt={cat.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                          ))}
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-stone-800 tracking-wide font-sans">
                          {catNamesStr}
                        </h3>
                      </div>

                      {/* 3. 五關卡回顧 */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#707040]/60 rounded-full inline-block"></span>
                            <h4 className="text-xs font-bold text-stone-800 tracking-wider">五維尋茶關卡歷程</h4>
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 font-mono">5 Dimensions</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5">
                          {stagesData.map((stage) => {
                            const getStageIcon = (id: string) => {
                              switch (id) {
                                case 'personality':
                                  return <Heart size={14} className="text-rose-500" />;
                                case 'zodiac':
                                  return <Sparkles size={14} className="text-amber-500" />;
                                case 'energy':
                                  return <Activity size={14} className="text-emerald-500" />;
                                case 'lifestyle':
                                  return <Moon size={14} className="text-indigo-500" />;
                                case 'sensory':
                                  return <Eye size={14} className="text-purple-500" />;
                                default:
                                  return <CheckCircle2 size={14} className="text-[#707040]" />;
                              }
                            };

                            return (
                              <div 
                                key={stage.id}
                                className="bg-white/80 hover:bg-white p-4 rounded-2xl border border-stone-100 shadow-xs flex gap-4 transition-all duration-300 hover:shadow-sm"
                                style={{ borderLeftWidth: '4px', borderLeftColor: '#707040' }}
                              >
                                <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                                  <img 
                                    src={stage.image} 
                                    alt={stage.title} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="p-0.5 bg-stone-50 rounded-md inline-flex items-center justify-center">
                                      {getStageIcon(stage.id)}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-stone-400 tracking-wider uppercase font-sans">
                                      {stage.name}
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-bold text-stone-800 truncate">
                                    {stage.title}
                                  </h5>
                                  <p className="text-[10px] text-stone-500 font-light leading-relaxed line-clamp-1">
                                    {stage.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                  </div>

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
    </div>
  );
};
