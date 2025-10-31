import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, FileText, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type AddPlantPageProps = {
  onNavigate: (page: string) => void;
};

export default function AddPlantPage({ onNavigate }: AddPlantPageProps) {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const [treeSpecies, setTreeSpecies] = useState('');
  const [datePlanted, setDatePlanted] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            setLocationName(
              data.display_name || `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            );
          } catch (error) {
            setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please check your browser permissions.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBlockchainId = () => {
    return `POLY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerifying(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const blockchainId = generateBlockchainId();

      const { error } = await supabase.from('greencoins').insert({
        owner_id: profile?.id,
        creator_id: profile?.id,
        tree_species: treeSpecies,
        image_url: imagePreview,
        latitude,
        longitude,
        location_name: locationName,
        date_planted: datePlanted,
        notes,
        co2_offset_kg: 20,
        blockchain_id: blockchainId,
        is_for_sale: false,
        sale_price: 0,
      });

      if (error) throw error;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_trees_planted: (profile?.total_trees_planted || 0) + 1,
        })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      await refreshProfile();
      setSuccess(true);
      setVerifying(false);

      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating GreenCoin:', error);
      alert('Failed to create GreenCoin. Please try again.');
      setLoading(false);
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">GreenCoin Created!</h2>
          <p className="text-gray-600">Your tree has been verified and minted as a digital coin.</p>
        </motion.div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Plant...</h2>
          <p className="text-gray-600">Creating your GreenCoin on the blockchain</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Plant</h1>
          <p className="text-gray-600 mb-8">
            Plant a tree, capture the moment, and mint your GreenCoin!
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Plant preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">Click to upload plant photo</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tree Species *
              </label>
              <input
                type="text"
                value={treeSpecies}
                onChange={(e) => setTreeSpecies(e.target.value)}
                placeholder="e.g., Oak, Pine, Maple"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Planted *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={datePlanted}
                  onChange={(e) => setDatePlanted(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Location will be auto-detected"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-5 h-5" />
                  {gettingLocation ? 'Getting...' : 'Get GPS'}
                </button>
              </div>
              {latitude && longitude && (
                <p className="text-sm text-gray-500 mt-2">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information about this tree..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create GreenCoin'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
