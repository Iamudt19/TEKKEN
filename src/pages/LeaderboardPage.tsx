import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TreePine, Coins, TrendingUp } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';

type LeaderboardEntry = Profile & {
  total_coins: number;
  total_co2_offset: number;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'trees' | 'coins' | 'co2'>('trees');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('total_trees_planted', { ascending: false });

      if (profilesError) throw profilesError;

      const enrichedData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: coins } = await supabase
            .from('greencoins')
            .select('co2_offset_kg')
            .eq('owner_id', profile.id);

          const total_coins = coins?.length || 0;
          const total_co2_offset = coins?.reduce((sum, coin) => sum + coin.co2_offset_kg, 0) || 0;

          return {
            ...profile,
            total_coins,
            total_co2_offset,
          };
        })
      );

      setLeaderboard(enrichedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard];
    switch (sortBy) {
      case 'trees':
        return sorted.sort((a, b) => b.total_trees_planted - a.total_trees_planted);
      case 'coins':
        return sorted.sort((a, b) => b.total_coins - a.total_coins);
      case 'co2':
        return sorted.sort((a, b) => b.total_co2_offset - a.total_co2_offset);
      default:
        return sorted;
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600';
    if (index === 1) return 'from-gray-300 to-gray-500';
    if (index === 2) return 'from-orange-400 to-orange-600';
    return 'from-green-500 to-emerald-600';
  };

  const totalStats = {
    totalTrees: leaderboard.reduce((sum, entry) => sum + entry.total_trees_planted, 0),
    totalCoins: leaderboard.reduce((sum, entry) => sum + entry.total_coins, 0),
    totalCO2: leaderboard.reduce((sum, entry) => sum + entry.total_co2_offset, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Top sustainability champions on GreenCoin 2.0</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <TreePine className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalTrees}</p>
                <p className="text-gray-600">Total Trees Planted</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Coins className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalCoins}</p>
                <p className="text-gray-600">GreenCoins in Circulation</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalCO2.toFixed(0)}</p>
                <p className="text-gray-600">CO₂ Offset (kg/year)</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rankings</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'trees' | 'coins' | 'co2')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="trees">Sort by Trees Planted</option>
              <option value="coins">Sort by GreenCoins Owned</option>
              <option value="co2">Sort by CO₂ Offset</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {getSortedLeaderboard().map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getRankColor(index)} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {getRankIcon(index)}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{entry.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">{entry.email}</p>
                  </div>

                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{entry.total_trees_planted}</p>
                      <p className="text-xs text-gray-600">Trees</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{entry.total_coins}</p>
                      <p className="text-xs text-gray-600">Coins</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{entry.total_co2_offset.toFixed(0)}</p>
                      <p className="text-xs text-gray-600">CO₂ kg/yr</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
