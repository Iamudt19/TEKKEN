import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Leaf, ArrowLeft, Share2, QrCode } from 'lucide-react';
import { supabase, GreenCoin, Profile } from '../lib/supabase';

type CoinDetailsPageProps = {
  coinId: string;
  onNavigate: (page: string) => void;
};

export default function CoinDetailsPage({ coinId, onNavigate }: CoinDetailsPageProps) {
  const [coin, setCoin] = useState<GreenCoin | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchCoinDetails();
  }, [coinId]);

  const fetchCoinDetails = async () => {
    try {
      const { data: coinData, error: coinError } = await supabase
        .from('greencoins')
        .select('*')
        .eq('id', coinId)
        .maybeSingle();

      if (coinError) throw coinError;
      if (!coinData) {
        alert('Coin not found');
        onNavigate('dashboard');
        return;
      }

      setCoin(coinData);

      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coinData.owner_id)
        .maybeSingle();

      setOwner(ownerData);

      const { data: creatorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coinData.creator_id)
        .maybeSingle();

      setCreator(creatorData);
    } catch (error) {
      console.error('Error fetching coin details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?coin=${coinId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateQRCode = () => {
    const shareUrl = `${window.location.origin}?coin=${coinId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading coin details...</p>
        </div>
      </div>
    );
  }

  if (!coin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </motion.button>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-green-400 to-emerald-500">
                {coin.image_url ? (
                  <img
                    src={coin.image_url}
                    alt={coin.tree_species}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-32 h-32 text-white opacity-50" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Link
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <QrCode className="w-5 h-5" />
                Show QR Code
              </button>
            </div>

            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Scan to View</h3>
                <img
                  src={generateQRCode()}
                  alt="QR Code"
                  className="mx-auto rounded-lg"
                />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{coin.tree_species}</h1>

              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{coin.location_name || 'Not specified'}</p>
                    {coin.latitude && coin.longitude && (
                      <p className="text-sm text-gray-500">
                        {coin.latitude.toFixed(6)}, {coin.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b">
                  <Calendar className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Date Planted</p>
                    <p className="text-gray-600">
                      {new Date(coin.date_planted).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b">
                  <User className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Current Owner</p>
                    <p className="text-gray-600">{owner?.full_name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b">
                  <User className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Original Planter</p>
                    <p className="text-gray-600">{creator?.full_name || 'Unknown'}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">CO₂ Offset per Year</span>
                    <span className="text-2xl font-bold text-green-600">{coin.co2_offset_kg} kg</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This tree offsets approximately {coin.co2_offset_kg} kg of CO₂ annually
                  </p>
                </div>

                {coin.blockchain_id && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">Blockchain ID</p>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {coin.blockchain_id}
                    </p>
                  </div>
                )}

                {coin.notes && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Notes</p>
                    <p className="text-gray-600">{coin.notes}</p>
                  </div>
                )}

                {coin.is_for_sale && (
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <p className="font-bold text-yellow-900 text-lg text-center">
                      Listed for Sale: ${coin.sale_price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
