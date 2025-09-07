'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Clock, Gift, Zap, Calendar, Trophy } from 'lucide-react';

interface RewardItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  amount: string;
  available: boolean;
  claimed: boolean;
  timer?: string;
  description: string;
  type: 'login' | 'instant' | 'weekly' | 'monthly';
}

const RewardsSection: React.FC = () => {
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState('6d 14h 32m');
  const [monthlyTimeLeft, setMonthlyTimeLeft] = useState('23d 8h 15m');
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate countdown timers
  useEffect(() => {
    const weeklyTimer = setInterval(() => {
      // This would normally be calculated from actual end time
      setWeeklyTimeLeft(prev => {
        // Simple countdown simulation
        const parts = prev.split(' ');
        let days = parseInt(parts[0].replace('d', ''));
        let hours = parseInt(parts[1].replace('h', ''));
        let minutes = parseInt(parts[2].replace('m', ''));

        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days--;
            if (days < 0) days = 6;
          }
        }

        return `${days}d ${hours}h ${minutes}m`;
      });
    }, 60000); // Update every minute

    const monthlyTimer = setInterval(() => {
      setMonthlyTimeLeft(prev => {
        const parts = prev.split(' ');
        let days = parseInt(parts[0].replace('d', ''));
        let hours = parseInt(parts[1].replace('h', ''));
        let minutes = parseInt(parts[2].replace('m', ''));

        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days--;
            if (days < 0) days = 29;
          }
        }

        return `${days}d ${hours}h ${minutes}m`;
      });
    }, 60000);

    return () => {
      clearInterval(weeklyTimer);
      clearInterval(monthlyTimer);
    };
  }, []);

  const handleClaimReward = (rewardId: string) => {
    console.log(`Claiming reward: ${rewardId}`);
    // TODO: Implement actual claim logic
  };

  return (
    <div className="relative z-10 flex flex-col h-full overflow-hidden">
      <div className="flex items-center mb-1 md:mb-3">
        <Gift className="w-2 h-2 md:w-4 md:h-4 text-[#00d4ff] mr-1 md:mr-2" />
        <h3 className="text-xs md:text-sm font-bold text-white truncate">Rewards Center</h3>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="space-y-0.5 md:space-y-2 overflow-hidden">
          {/* Login Bonus - Big Bar */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 md:p-2 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-between mb-0.5 md:mb-2">
              <div className="flex items-center space-x-1 md:space-x-2 min-w-0 flex-1">
                <div className="text-[#00d4ff] flex-shrink-0"><Gift className="w-2 h-2 md:w-4 md:h-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-xs md:text-sm truncate">Login Bonus</div>
                  <div className="text-gray-400 text-xs truncate">Daily login reward</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-green-400 font-bold text-xs md:text-sm">$2.50</div>
              </div>
            </div>
            <Button
              onClick={() => handleClaimReward('login')}
              className="w-full text-xs md:text-sm py-1 md:py-2 h-4 md:h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold rounded-md transition-all duration-200"
            >
              Claim Reward
            </Button>
          </div>

          {/* Rakeback Section - Three Smaller Bars */}
          <div className="grid grid-cols-3 gap-1 md:gap-1.5">
            {/* Rakeback */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 md:p-1.5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-200 overflow-hidden">
              <div className="text-center mb-0.5 md:mb-1">
                <div className="text-[#00d4ff] mb-0"><Zap className="w-2 h-2 md:w-4 md:h-4 mx-auto" /></div>
                <div className="text-white font-semibold text-xs truncate">Rakeback</div>
                <div className="text-green-400 font-bold text-xs truncate">$5.00</div>
              </div>
              <div className="w-full text-center py-0 md:py-1 h-3 md:h-6 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold text-xs rounded-md flex items-center justify-center cursor-pointer">
                Claim
              </div>
            </div>

            {/* Weekly Rakeback */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 md:p-1.5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-200 overflow-hidden">
              <div className="text-center mb-0.5 md:mb-1">
                <div className="text-[#00d4ff] mb-0"><Calendar className="w-2 h-2 md:w-4 md:h-4 mx-auto" /></div>
                <div className="text-white font-semibold text-xs truncate">Weekly</div>
                <div className="text-green-400 font-bold text-xs truncate">$25.00</div>
              </div>
              <div className="w-full text-center py-0 md:py-1 h-3 md:h-6 bg-gray-600/50 text-gray-400 text-xs rounded-md flex items-center justify-center">
                <span className="truncate">{weeklyTimeLeft.split(' ')[0]}</span>
              </div>
            </div>

            {/* Monthly Rakeback */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 md:p-1.5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-200 overflow-hidden">
              <div className="text-center mb-0.5 md:mb-1">
                <div className="text-[#00d4ff] mb-0"><Trophy className="w-2 h-2 md:w-4 md:h-4 mx-auto" /></div>
                <div className="text-white font-semibold text-xs truncate">Monthly</div>
                <div className="text-green-400 font-bold text-xs truncate">$100</div>
              </div>
              <div className="w-full text-center py-0 md:py-1 h-3 md:h-6 bg-gray-600/50 text-gray-400 text-xs rounded-md flex items-center justify-center">
                <span className="truncate">{monthlyTimeLeft.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress to Next Rank - Positioned at bottom */}
        <div className="mt-auto pt-0.5 md:pt-1 border-t border-[#00d4ff]/20 overflow-hidden">
          <div className="text-xs text-gray-400 truncate">XP to Next Rank</div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] h-1 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 truncate">7,800 / 10,000 XP</span>
            <span className="text-[#00d4ff] truncate">Bronze → Silver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsSection;