import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewType } from '../layout/Header';

interface LandingPageProps {
  onViewChange: (view: ViewType) => void;
}

export function LandingPage({ onViewChange }: LandingPageProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-14 overflow-y-auto relative select-none">
      {/* Background Dots */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(150,150,150,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="flex flex-col items-center justify-center flex-1 max-w-4xl w-full px-6 py-12 relative z-10">
        
        {/* Main Hero */}
        <div className="text-center mb-16 relative">
          {/* Decorative circles (subtle) */}
          <div className="absolute -top-12 -left-12 w-24 h-24 border border-stone-200/50 dark:border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-32 -right-20 w-32 h-32 border border-stone-200/50 dark:border-white/5 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-stone-900 dark:text-white mb-8 transition-colors">
            Game Design Workspace
          </h1>
          
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            在这里，游戏概念在
            <span className="relative inline-block mx-1">
               <span className="relative z-10 font-semibold px-1 text-stone-900 dark:text-white">创意碰撞</span>
               <span className="absolute bottom-0 left-0 w-full h-[6px] bg-stone-200 dark:bg-stone-800 -z-0"></span>
            </span>
            中诞生。我们提供一个集
            <span className="inline-block bg-stone-200/50 dark:bg-white/10 px-2 py-0.5 rounded-md font-medium mx-1 text-stone-800 dark:text-stone-200">无限发散、机制冲突与逻辑归整</span>
            于一体的游戏设计沙盘。连接规则、世界观与核心循环，让灵感从混沌走向精巧的系统。
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => onViewChange('management')}
              className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 dark:bg-white dark:hover:bg-stone-200 text-stone-900 px-6 py-2.5 rounded-full font-medium transition-colors text-sm cursor-pointer"
            >
              进入设计沙盘 <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button 
              onClick={() => onViewChange('workspace')}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm cursor-pointer"
            >
              即刻投身脑暴
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-stone-200/50 dark:bg-white/5 my-12" />

        {/* Secondary Section */}
        <div className="w-full text-center relative px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-20 mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              沉淀极致的规则与灵感碰撞
            </h2>
            <button className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-colors text-sm font-medium cursor-pointer">
              查看核心机制库 <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            收集并归一演化过程中留存的绝妙玩法提示、参考世界图景、以及历经冲突淬炼后的游戏核心逻辑。
          </p>
        </div>

      </div>
    </div>
  );
}
