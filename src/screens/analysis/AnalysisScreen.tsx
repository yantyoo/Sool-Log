import React from 'react';
import { useAppData } from '../../state/AppDataContext';
import { formatCurrency } from '../../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { TrendingUp, Target, Calendar, PieChart as PieIcon, Activity, ChevronRight, Sparkles, Flame, Wallet, Brain, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';
import EmptyState from '../../components/EmptyState';
import { getDrinkCategoryLabel } from '../../lib/recordForms';

export default function AnalysisScreen({ onOpenProgress }: { onOpenProgress?: () => void }) {
  const { logs, goals } = useAppData();

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
          <p className="text-[15px] text-white/40 leading-relaxed font-medium">데이터가 쌓이면 스마트한 건강 인사이트와<br />절주 리포트를 확인하실 수 있습니다.</p>
        </div>
        <div className="pt-4">
          <button className="btn-primary px-12 py-5 text-lg">첫 번째 기록 시작하기</button>
        </div>
      </motion.div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyLogs = logs.filter((log) => new Date(log.consumedAt) >= monthStart);
  const totalSpend = monthlyLogs.reduce((sum, log) => sum + (log.price ?? 0), 0);

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
  const barData = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((name, index) => ({
    name,
    count: weekdayCounts[index] ?? 0,
  }));

  const COLORS = ['#6366f1', '#a855f7', '#818cf8', '#c0c1ff', '#4f46e5'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0, 0, 1] as const } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden" 
      animate="visible" 
      className="space-y-12 pb-32 px-1"
    >
      {/* Editorial Title Section */}
      <motion.div variants={itemVariants} className="space-y-2 px-2 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-[1px] bg-primary-light/50" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-light/80">Premium Analytics</p>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tighter uppercase leading-none">
          Data <span className="text-white/20">Ritual</span>
        </h2>
      </motion.div>

      {/* Advanced Consumption Analysis (Primary Charts) */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Weekly Pattern - Area Chart with Glow */}
        <motion.div variants={itemVariants} className="card p-8 space-y-8 group relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/40 group-hover:text-primary-light transition-all border-white/5">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Frequency</p>
                <h3 className="text-lg font-black tracking-tight font-sans">주간 음주 흐름</h3>
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
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }} 
                  dy={15}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '13px', padding: '12px 16px', fontWeight: 700, backdropFilter: 'blur(10px)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Drink Ratio - Donut Chart with Glass Center */}
        <motion.div variants={itemVariants} className="card p-8 space-y-10 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/40 group-hover:text-secondary transition-all border-white/5">
                <PieIcon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Distribution</p>
                <h3 className="text-lg font-black tracking-tight font-sans">선호 주종 분포</h3>
              </div>
            </div>
          </div>
          
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '13px', padding: '12px 16px', fontWeight: 700, backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Premium Glass Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md flex flex-col items-center justify-center shadow-inner">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Total Logs</span>
                <span className="text-3xl font-black tracking-tighter text-gradient">{monthlyLogs.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-[20px] bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-colors">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length], boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}80` }} />
                <span className="text-[11px] font-extrabold text-white/70">{item.name}</span>
                <span className="text-[11px] font-black text-white/30 ml-auto">{item.value}회</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Summary & Insights */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_#a855f7]" />
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Financial Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          <motion.div variants={itemVariants} className="card p-7 space-y-5 bg-linear-to-br from-primary/15 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform border border-primary/20">
              <Wallet size={22} />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/30">한 달간 지출</p>
              <p className="text-2xl font-black tracking-tighter">{formatCurrency(totalSpend).replace('₩','')}<span className="text-[10px] ml-1 opacity-20">KRW</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Intelligence Banner */}
        <motion.div 
          variants={itemVariants} 
          className="card p-8 bg-linear-to-br from-[#1a1a1c] to-surface border-white/[0.05] flex items-center gap-6 group relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-[24px] glass flex flex-none items-center justify-center text-secondary border-white/10 shadow-2xl relative z-10">
            <HeartPulse size={30} className="animate-pulse" />
          </div>
          <div className="space-y-1.5 relative z-10">
            <h4 className="text-[16px] font-black text-white tracking-tight font-sans">절주 패턴 분석</h4>
            <p className="text-xs font-medium text-white/30 leading-relaxed">
              기록을 분석한 결과 주말보다 평일에 더 잦은 소비가 발생하고 있습니다. 지갑 건강과 활기찬 아침을 위해 조금 더 조절해볼까요?
            </p>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/5 rounded-full blur-[60px]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
