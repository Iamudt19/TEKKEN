import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Coins, TreePine, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, GreenCoin } from '../lib/supabase';
import GreenCoinCard from '../components/GreenCoinCard';

type DashboardProps = {
  onNavigate: (page: string, coinId?: string) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, refreshProfile } = useAuth();
  const [coins, setCoins] = useState<GreenCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const { data, error } = await supabase
        .from('greencoins')
        .select('*')
        .eq('owner_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoins(data || []);
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (coin: GreenCoin) => {
    const shareUrl = `${window.location.origin}?coin=${coin.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSell = async (coin: GreenCoin) => {
    const price = prompt('Enter sale price in dollars:', '50');
    if (!price) return;

    try {
      const { error } = await supabase
        .from('greencoins')
        .update({
          is_for_sale: true,
          sale_price: parseFloat(price),
        })
        .eq('id', coin.id);

      if (error) throw error;
      await fetchCoins();
    } catch (error) {
      console.error('Error listing coin for sale:', error);
      alert('Failed to list coin for sale');
    }
  };

  const totalCO2Offset = coins.reduce((sum, coin) => sum + coin.co2_offset_kg, 0);
  const coinsForSale = coins.filter((coin) => coin.is_for_sale).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your GreenCoins and track your environmental impact</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-8 h-8" />
              <span className="text-3xl font-bold">{coins.length}</span>
            </div>
            <div className="text-green-100">Total GreenCoins</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TreePine className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{profile?.total_trees_planted || 0}</span>
            </div>
            <div className="text-gray-600">Trees Planted</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{totalCO2Offset}</span>
            </div>
            <div className="text-gray-600">CO₂ Offset (kg/year)</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-3xl font-bold">${profile?.balance || 0}</span>
            </div>
            <div className="text-yellow-100">Available Balance</div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My GreenCoins</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('add')}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Plant
          </motion.button>
        </div>

        {shareMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 text-green-800 px-4 py-3 rounded-lg mb-6 text-center font-medium"
          >
            {shareMessage}
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your GreenCoins...</p>
          </div>
        ) : coins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow"
          >
            <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't planted any trees yet!</p>
            <button
              onClick={() => onNavigate('add')}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Plant your first tree →
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coins.map((coin) => (
              <GreenCoinCard
                key={coin.id}
                coin={coin}
                onViewDetails={(id) => onNavigate('coin', id)}
                onShare={handleShare}
                onSell={handleSell}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
