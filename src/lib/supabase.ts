import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  balance: number;
  total_trees_planted: number;
  created_at: string;
  updated_at: string;
};

export type GreenCoin = {
  id: string;
  owner_id: string;
  creator_id: string;
  tree_species: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string;
  date_planted: string;
  notes: string;
  co2_offset_kg: number;
  blockchain_id: string;
  is_for_sale: boolean;
  sale_price: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  greencoin_id: string;
  from_user_id: string;
  to_user_id: string;
  price: number;
  transaction_date: string;
};
