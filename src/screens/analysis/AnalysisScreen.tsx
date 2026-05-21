import React, { useMemo } from 'react';
import { useAppData } from '../../state/AppDataContext';
import { formatCurrency } from '../../lib/utils';
import { 
  XAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, AreaChart, Area, CartesianGrid
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, Sparkles, Wallet, HeartPulse, Shield, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { getDrinkCategoryLabel } from '../../lib/recordForms';

export default function AnalysisScreen({ onOpenProgress }: { onOpenProgress?: () => void }) {
  const { logs } = useAppData();

  if (logs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-[32px] glass flex items-center justify-center text-primary-light border-white/10">
            <Activity size={48} className="animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black tracking-tight font-sans">당신만의 음주 지도가<br />그려지는 중입니다</h2>
          <p className="text-[15px] text-white/40 leading-relaxed font-medium">데이터가 쌓이면 스마트한 건강 인사이트와<br />음주 분석 리포트를 확인하실 수 있습니다.</p>
        </div>
      </motion.div>
    );
  }

  const now = new Date();
  
  // Weekly calculations
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyLogs = logs.filter((log) => new Date(log.consumedAt) >= weekAgo);
  const weeklyPureAlcohol = weeklyLogs.reduce((sum, log) => {
    const abv = log.abv ?? 0;
    const vol = log.volumeMl ?? 0;
    return sum + (vol * (abv / 100) * 0.789);
  }, 0);

  // Month calculations
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyLogs = logs.filter((log) => new Date(log.consumedAt) >= monthStart);
  const monthlySpend = monthlyLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);

  // Category Data for Pie Chart
  const categoryDataMap = monthlyLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.drinkCategory] = (acc[log.drinkCategory] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({ 
    name: getDrinkCategoryLabel(name as any), 
    value 
  }));

  // Weekday Data for Bar Chart
  const weekdayCounts = monthlyLogs.reduce<Record<number, number>>((acc, log) => {
    const day = new Date(log.consumedAt).getDay();
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  
  // Day names localized in Korean
  const barData = [
    { name: '일', key: 'SUN', count: weekdayCounts[0] ?? 0 },
    { name: '월', key: 'MON', count: weekdayCounts[1] ?? 0 },
    { name: '화', key: 'TUE', count: weekdayCounts[2] ?? 0 },
    { name: '수', key: 'WED', count: weekdayCounts[3] ?? 0 },
    { name: '목', key: 'THU', count: weekdayCounts[4] ?? 0 },
    { name: '금', key: 'FRI', count: weekdayCounts[5] ?? 0 },
    { name: '토', key: 'SAT', count: weekdayCounts[6] ?? 0 },
  ];

  const COLORS = ['#6366f1', '#a855f7', '#818cf8', '#c0c1ff', '#4f46e5'];

  // Health Risk Evaluator (Weekly Pure Alcohol intake in grams)
  const getHealthRiskLevel = (alcoholGrams: number) => {
    if (alcoholGrams < 70) {
      return { 
        level: '안전', 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20',
        icon: ShieldCheck, 
        desc: '간에 부담이 거의 없는 안전한 알코올 섭취량을 유지하고 계십니다.' 
      };
    } else if (alcoholGrams < 150) {
      return { 
        level: '주의', 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20',
        icon: Shield, 
        desc: '적정 주량을 조율 중입니다. 남은 주간은 간이 회복할 수 있는 해독 시간을 충분히 확보해 주세요.' 
      };
    } else {
      return { 
        level: '위험', 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20',
        icon: ShieldAlert, 
        desc: '주간 음주 권장량을 초과했습니다. 다음 즐거운 술자리를 위해 당분간 신체 에너지를 완충하고 충전 텀을 충분히 가지는 것이 좋습니다.' 
      };
    }
  };

  const risk = getHealthRiskLevel(weeklyPureAlcohol);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden" 
      animate="visible" 
      className="space-y-8 pb-32 px-1"
    >
      {/* Editorial Title Section */}
      <motion.div variants={itemVariants} className="space-y-2 px-2 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-[1px] bg-primary-light/50" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-light/80">데이터 리추얼 통계</p>
        </div>
        <h2 className="text-2xl font-black tracking-tight leading-none">
          안전 및 음주 페이스 분석
        </h2>
      </motion.div>

      {/* Health Signal Indicator (건강 신호등) */}
      <motion.div 
        variants={itemVariants} 
        className={`card p-6 ${risk.bg} ${risk.border} border flex flex-col gap-4 relative overflow-hidden`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${risk.color}`}>
              <risk.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/30">주간 알코올 평가 지표</p>
              <h3 className="text-base font-extrabold text-white">건강 안전 상태: <span className={risk.color}>{risk.level}</span></h3>
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black border ${risk.color} ${risk.border}`}>
            주간 {weeklyPureAlcohol.toFixed(1)}g 섭취
          </span>
        </div>
        
        <p className="text-xs font-semibold text-white/60 leading-relaxed z-10 pr-2">
          {risk.desc}
        </p>
        
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Activity size={80} />
        </div>
      </motion.div>

      {/* Advanced Consumption Analysis (Primary Charts) */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Weekly Pattern - Area Chart with Glow */}
        <motion.div variants={itemVariants} className="card p-6 space-y-6 group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/30 group-hover:text-primary-light border-white/5 transition-colors">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">음주 횟수</p>
                <h3 className="text-base font-extrabold tracking-tight font-sans">요일별 음주 빈도</h3>
              </div>
            </div>
          </div>
          
          <div className="h-56 w-full mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 800 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '12px', padding: '10px 14px', fontWeight: 700, backdropFilter: 'blur(10px)', color: '#fff' }}
                  labelFormatter={(label) => `${label}요일`}
                  formatter={(value) => [`${value}회`, '음주 건수']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Drink Ratio - Donut Chart with Glass Center */}
        <motion.div variants={itemVariants} className="card p-6 space-y-8 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/30 group-hover:text-secondary border-white/5 transition-colors">
                <PieIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">주종 분포</p>
                <h3 className="text-base font-extrabold tracking-tight font-sans">선호 주종 비율</h3>
              </div>
            </div>
          </div>
          
          <div className="relative h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', fontSize: '12px', padding: '10px 14px', fontWeight: 700, backdropFilter: 'blur(10px)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Premium Glass Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.04] backdrop-blur-md flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">이번 달 누적</span>
                <span className="text-2xl font-black tracking-tighter text-gradient">{monthlyLogs.length}회</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length], boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}60` }} />
                <span className="text-xs font-bold text-white/70">{item.name}</span>
                <span className="text-xs font-extrabold text-white/30 ml-auto">{item.value}회</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Summary & Insights */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_#a855f7]" />
           <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40">지출 분석 리포트</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          <motion.div variants={itemVariants} className="card p-6 flex items-center justify-between bg-linear-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light border border-primary/20 group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/30">이번 달 누적 지출</p>
                <p className="text-2xl font-black tracking-tighter">{formatCurrency(monthlySpend).replace('₩','')}<span className="text-[10px] ml-1 opacity-20">KRW</span></p>
              </div>
            </div>
            <button 
              onClick={onOpenProgress}
              className="px-4 py-2.5 rounded-xl glass border-white/10 text-xs font-bold text-primary-light hover:bg-primary/20 active:scale-95 transition-all"
            >
              목표 관리
            </button>
          </motion.div>
        </div>

        {/* Intelligence Banner */}
        <motion.div 
          variants={itemVariants} 
          className="card p-6 bg-linear-to-br from-surface to-background border-white/[0.04] flex items-center gap-5 group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl glass flex flex-none items-center justify-center text-secondary border-white/5 shadow-2xl relative z-10">
            <HeartPulse size={24} className="animate-pulse" />
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="text-sm font-extrabold text-white tracking-tight">스마트 에디토리얼 의견</h4>
            <p className="text-xs font-semibold text-white/40 leading-relaxed">
              기록을 분석한 결과 평소보다 주간 알코올 분해 부담이 다소 높은 주간을 보냈습니다. 오늘 저녁은 시원한 티 음료와 함께 디톡스 시간을 가져보는 건 어떨까요?
            </p>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/5 rounded-full blur-[60px] pointer-events-none" />
        </motion.div>
      </div>
    </motion.div>
  );
}
