/*
  # GreenCoin 2.0 Database Schema

  ## Overview
  Creates the core database structure for the GreenCoin sustainability platform
  where planted trees become digital tradable coins.

  ## New Tables
  
  ### 1. `profiles`
  User profile data extending Supabase auth.users
  - `id` (uuid, FK to auth.users) - User ID
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `balance` (numeric) - Dummy currency balance for buying coins
  - `total_trees_planted` (integer) - Count of trees planted
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `greencoins`
  Digital coins representing planted trees
  - `id` (uuid, PK) - Unique coin ID
  - `owner_id` (uuid, FK to profiles) - Current owner
  - `creator_id` (uuid, FK to profiles) - Original planter
  - `tree_species` (text) - Type of tree planted
  - `image_url` (text) - Photo of the plant
  - `latitude` (numeric) - GPS latitude coordinate
  - `longitude` (numeric) - GPS longitude coordinate
  - `location_name` (text) - Human-readable location
  - `date_planted` (date) - When tree was planted
  - `notes` (text) - Additional notes about the plant
  - `co2_offset_kg` (numeric) - Estimated CO2 offset in kg per year
  - `blockchain_id` (text) - Mock blockchain/Polygon testnet ID
  - `is_for_sale` (boolean) - Whether coin is listed in marketplace
  - `sale_price` (numeric) - Price if for sale
  - `created_at` (timestamptz) - Coin creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `transactions`
  History of coin trades
  - `id` (uuid, PK) - Transaction ID
  - `greencoin_id` (uuid, FK to greencoins) - Coin being traded
  - `from_user_id` (uuid, FK to profiles) - Seller
  - `to_user_id` (uuid, FK to profiles) - Buyer
  - `price` (numeric) - Sale price
  - `transaction_date` (timestamptz) - When trade occurred

  ## Security
  - Enable RLS on all tables
  - Users can view their own profile and update certain fields
  - Users can create greencoins
  - Users can view all greencoins but only modify their own
  - Users can view marketplace listings (coins for sale)
  - Transaction history is viewable by involved parties

  ## Notes
  - CO2 offset is estimated at ~20kg per tree per year (adjustable)
  - Balance starts at 1000 for all new users
  - Blockchain IDs are mock/simulated for demo purposes
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  balance numeric DEFAULT 1000,
  total_trees_planted integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create greencoins table
CREATE TABLE IF NOT EXISTS greencoins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id),
  tree_species text NOT NULL,
  image_url text DEFAULT '',
  latitude numeric,
  longitude numeric,
  location_name text DEFAULT '',
  date_planted date NOT NULL,
  notes text DEFAULT '',
  co2_offset_kg numeric DEFAULT 20,
  blockchain_id text DEFAULT '',
  is_for_sale boolean DEFAULT false,
  sale_price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE greencoins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view greencoins"
  ON greencoins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create greencoins"
  ON greencoins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id AND auth.uid() = creator_id);

CREATE POLICY "Owners can update their greencoins"
  ON greencoins FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their greencoins"
  ON greencoins FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  greencoin_id uuid NOT NULL REFERENCES greencoins(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles(id),
  to_user_id uuid NOT NULL REFERENCES profiles(id),
  price numeric NOT NULL,
  transaction_date timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = to_user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_greencoins_owner ON greencoins(owner_id);
CREATE INDEX IF NOT EXISTS idx_greencoins_creator ON greencoins(creator_id);
CREATE INDEX IF NOT EXISTS idx_greencoins_for_sale ON greencoins(is_for_sale) WHERE is_for_sale = true;
CREATE INDEX IF NOT EXISTS idx_transactions_greencoin ON transactions(greencoin_id);
CREATE INDEX IF NOT EXISTS idx_transactions_users ON transactions(from_user_id, to_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_greencoins_updated_at ON greencoins;
CREATE TRIGGER update_greencoins_updated_at
  BEFORE UPDATE ON greencoins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();