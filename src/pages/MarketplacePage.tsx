import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, GreenCoin } from '../lib/supabase';
import GreenCoinCard from '../components/GreenCoinCard';

type MarketplacePageProps = {
  onNavigate: (page: string, coinId?: string) => void;
};

export default function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const { profile, refreshProfile } = useAuth();
  const [coins, setCoins] = useState<GreenCoin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<GreenCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchMarketplaceCoins();
  }, []);

  useEffect(() => {
    filterAndSortCoins();
  }, [coins, searchTerm, filterSpecies, sortBy]);

  const fetchMarketplaceCoins = async () => {
    try {
      const { data, error } = await supabase
        .from('greencoins')
        .select('*')
        .eq('is_for_sale', true)
        .neq('owner_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoins(data || []);
    } catch (error) {
      console.error('Error fetching marketplace coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCoins = () => {
    let result = [...coins];

    if (searchTerm) {
      result = result.filter(
        (coin) =>
          coin.tree_species.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSpecies !== 'all') {
      result = result.filter((coin) => coin.tree_species === filterSpecies);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case 'price-high':
        result.sort((a, b) => b.sale_price - a.sale_price);
        break;
      case 'co2-high':
        result.sort((a, b) => b.co2_offset_kg - a.co2_offset_kg);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredCoins(result);
  };

  const handleBuy = async (coin: GreenCoin) => {
    if (!profile) return;

    if (profile.balance < coin.sale_price) {
      alert('Insufficient balance!');
      return;
    }

    const confirmed = window.confirm(
      `Purchase ${coin.tree_species} for $${coin.sale_price}?`
    );

    if (!confirmed) return;

    try {
      const { error: transactionError } = await supabase.from('transactions').insert({
        greencoin_id: coin.id,
        from_user_id: coin.owner_id,
        to_user_id: profile.id,
        price: coin.sale_price,
      });

      if (transactionError) throw transactionError;

      const { error: coinError } = await supabase
        .from('greencoins')
        .update({
          owner_id: profile.id,
          is_for_sale: false,
          sale_price: 0,
        })
        .eq('id', coin.id);

      if (coinError) throw coinError;

      const { error: buyerError } = await supabase
        .from('profiles')
        .update({
          balance: profile.balance - coin.sale_price,
        })
        .eq('id', profile.id);

      if (buyerError) throw buyerError;

      const { data: sellerData } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', coin.owner_id)
        .single();

      if (sellerData) {
        await supabase
          .from('profiles')
          .update({
            balance: sellerData.balance + coin.sale_price,
          })
          .eq('id', coin.owner_id);
      }

      await refreshProfile();
      await fetchMarketplaceCoins();

      alert('Purchase successful!');
    } catch (error) {
      console.error('Error purchasing coin:', error);
      alert('Failed to complete purchase. Please try again.');
    }
  };

  const uniqueSpecies = Array.from(new Set(coins.map((coin) => coin.tree_species)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenCoin Marketplace</h1>
          <p className="text-gray-600">
            Purchase verified GreenCoins to offset your carbon footprint
          </p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by species or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Species</option>
                {uniqueSpecies.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="co2-high">Highest CO₂ Offset</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredCoins.length} {filteredCoins.length === 1 ? 'coin' : 'coins'} available
          </p>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
            Your Balance: ${profile?.balance || 0}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading marketplace...</p>
          </div>
        ) : filteredCoins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl shadow"
          >
            <p className="text-gray-600">No GreenCoins available matching your criteria.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoins.map((coin) => (
              <GreenCoinCard
                key={coin.id}
                coin={coin}
                onViewDetails={(id) => onNavigate('coin', id)}
                onBuy={handleBuy}
                isMarketplace={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
