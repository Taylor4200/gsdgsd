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

  const rewards: RewardItem[] = [
    {
      id: 'login',
      title: 'Login Bonus',
      icon: <Gift className="w-4 h-4" />,
      amount: '$2.50',
      available: true,
      claimed: false,
      description: 'Daily login reward',
      type: 'login'
    },
    {
      id: 'weekly-rakeback',
      title: 'Weekly Rakeback',
      icon: <Calendar className="w-4 h-4" />,
      amount: '$25.00',
      available: false,
      claimed: false,
      timer: weeklyTimeLeft,
      description: 'Weekly rakeback bonus',
      type: 'weekly'
    },
    {
      id: 'monthly-rakeback',
      title: 'Monthly Rakeback',
      icon: <Trophy className="w-4 h-4" />,
      amount: '$100.00',
      available: false,
      claimed: false,
      timer: monthlyTimeLeft,
      description: 'Monthly rakeback bonus',
      type: 'monthly'
    }
  ];

  const handleClaimReward = (rewardId: string) => {
    console.log(`Claiming reward: ${rewardId}`);
    // TODO: Implement actual claim logic
  };

  return (
    <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center mb-2">
          <Gift className="w-4 h-4 text-[#00d4ff] mr-2" />
          <h3 className="text-sm font-bold text-white">Rewards Center</h3>
        </div>

      <div className="space-y-1.5">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-black/30 backdrop-blur-sm rounded-lg p-1.5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="text-[#00d4ff]">{reward.icon}</div>
                <div>
                  <div className="text-white font-semibold text-xs">{reward.title}</div>
                  <div className="text-gray-400 text-xs">{reward.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-xs">{reward.amount}</div>
                {reward.timer && (
                  <div className="flex items-center text-[#00d4ff] text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {reward.timer}
                  </div>
                )}
              </div>
            </div>

            {reward.available ? (
              <Button
                onClick={() => handleClaimReward(reward.id)}
                className="w-full text-xs py-1 h-6 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold rounded-md transition-all duration-200"
                disabled={reward.claimed}
              >
                {reward.claimed ? '✅ Claimed' : 'Claim Reward'}
              </Button>
            ) : (
              <div className="w-full text-center py-1 h-6 bg-gray-600/50 text-gray-400 text-xs rounded-md flex items-center justify-center">
                {reward.timer ? `Available in ${reward.timer}` : 'Coming Soon'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* XP Progress to Next Rank */}
      <div className="mt-1 pt-0.5 border-t border-[#00d4ff]/20">
        <div className="text-xs text-gray-400">XP to Next Rank</div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] h-1 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">7,800 / 10,000 XP</span>
          <span className="text-[#00d4ff]">Bronze → Silver</span>
        </div>
      </div>
    </div>
  );
};

export default RewardsSection;
