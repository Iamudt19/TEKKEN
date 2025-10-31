import { motion } from 'framer-motion';
import { MapPin, Calendar, Share2, ShoppingCart, Eye, Leaf } from 'lucide-react';
import { GreenCoin } from '../lib/supabase';

type GreenCoinCardProps = {
  coin: GreenCoin;
  onViewDetails?: (coinId: string) => void;
  onShare?: (coin: GreenCoin) => void;
  onSell?: (coin: GreenCoin) => void;
  onBuy?: (coin: GreenCoin) => void;
  showActions?: boolean;
  isMarketplace?: boolean;
};

export default function GreenCoinCard({
  coin,
  onViewDetails,
  onShare,
  onSell,
  onBuy,
  showActions = true,
  isMarketplace = false,
}: GreenCoinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-500">
        {coin.image_url ? (
          <img
            src={coin.image_url}
            alt={coin.tree_species}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-20 h-20 text-white opacity-50" />
          </div>
        )}
        {coin.is_for_sale && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            For Sale
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{coin.tree_species}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{coin.location_name || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Planted: {new Date(coin.date_planted).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">CO₂ Offset/year</span>
            <span className="font-bold text-green-600">{coin.co2_offset_kg} kg</span>
          </div>
          {coin.blockchain_id && (
            <div className="mt-2 text-xs text-gray-500 truncate">
              ID: {coin.blockchain_id}
            </div>
          )}
        </div>

        {coin.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{coin.notes}</p>
        )}

        {showActions && (
          <div className="flex gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(coin.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View</span>
              </button>
            )}
            {!isMarketplace && onShare && (
              <button
                onClick={() => onShare(coin)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
            {!isMarketplace && onSell && !coin.is_for_sale && (
              <button
                onClick={() => onSell(coin)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Sell</span>
              </button>
            )}
            {isMarketplace && onBuy && coin.is_for_sale && (
              <button
                onClick={() => onBuy(coin)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Buy ${coin.sale_price}</span>
              </button>
            )}
          </div>
        )}

        {coin.is_for_sale && !isMarketplace && (
          <div className="mt-3 text-center text-sm font-semibold text-green-600">
            Listed for ${coin.sale_price}
          </div>
        )}
      </div>
    </motion.div>
  );
}
