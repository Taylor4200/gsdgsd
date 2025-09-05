-- Raffle System Database Schema
-- Create raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  total_prize DECIMAL(15,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'ended', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create raffle_prizes table
CREATE TABLE IF NOT EXISTS raffle_prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  place INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_game_multipliers table
CREATE TABLE IF NOT EXISTS raffle_game_multipliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  wager_requirement DECIMAL(15,2) NOT NULL DEFAULT 1000.00,
  tickets_per_wager INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_tickets table
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tickets_earned INTEGER NOT NULL DEFAULT 0,
  total_wagered DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(raffle_id, user_id)
);

-- Create raffle_winners table
CREATE TABLE IF NOT EXISTS raffle_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id UUID REFERENCES raffle_prizes(id) ON DELETE CASCADE,
  tickets_used INTEGER NOT NULL,
  won_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_end_date ON raffles(end_date);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user_id ON raffle_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_id ON raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_winners_raffle_id ON raffle_winners(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_game_multipliers_raffle_id ON raffle_game_multipliers(raffle_id);

-- Enable RLS
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_game_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Raffles: Everyone can read active raffles, admins can manage all
CREATE POLICY "Anyone can view active raffles" ON raffles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage raffles" ON raffles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Raffle prizes: Everyone can read, admins can manage
CREATE POLICY "Anyone can view raffle prizes" ON raffle_prizes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage raffle prizes" ON raffle_prizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Game multipliers: Everyone can read, admins can manage
CREATE POLICY "Anyone can view game multipliers" ON raffle_game_multipliers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage game multipliers" ON raffle_game_multipliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Tickets: Users can view their own, admins can view all
CREATE POLICY "Users can view own tickets" ON raffle_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON raffle_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert tickets" ON raffle_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update tickets" ON raffle_tickets
  FOR UPDATE USING (true);

-- Winners: Everyone can read, admins can manage
CREATE POLICY "Anyone can view winners" ON raffle_winners
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage winners" ON raffle_winners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
