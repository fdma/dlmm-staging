export interface VolumeData {
  min_30: number;
  hour_1: number;
  hour_2: number;
  hour_4: number;
  hour_12: number;
  hour_24: number;
}

export interface Pool {
  address: string;
  name: string;
  liquidity: string;
  volume: VolumeData;
  mint_x: string;
  mint_y: string;
  reserve_x_amount: number;
  reserve_y_amount: number;
  current_price: number;
  bin_step: number;
}

export interface AnalyzedPool extends Pool {
  volumeLiquidityRatio: number;
  hourlyVolume: number;
  liquidityValue: number;
}

export interface EnrichedPool extends Pool {
  volumeLiquidityRatio: number;
  hourlyVolume: number;
  liquidityValue: number;
  baseToken?: {
    address: string;
    symbol: string;
    name?: string;
    imageUrl?: string;
    tags?: string[];
  };
  quoteToken?: {
    address: string;
    symbol: string;
    name?: string;
    imageUrl?: string;
    tags?: string[];
  };
  isUpdated?: boolean;
}

export interface MeteoraPair {
  address: string;
  name: string;
  mint_x: string;
  mint_y: string;
  reserve_x: string;
  reserve_y: string;
  reserve_x_amount: number;
  reserve_y_amount: number;
  bin_step: number;
  base_fee_percentage: string;
  max_fee_percentage: string;
  protocol_fee_percentage: string;
  liquidity: string;
  reward_mint_x: string;
  reward_mint_y: string;
  fees_24h: number;
  today_fees: number;
  trade_volume_24h: number;
  cumulative_trade_volume: string;
  cumulative_fee_volume: string;
  current_price: number;
  apr: number;
  apy: number;
  farm_apr: number;
  farm_apy: number;
  hide: boolean;
  is_blacklisted: boolean;
  fees: {
    min_30: number;
    hour_1: number;
    hour_2: number;
    hour_4: number;
    hour_12: number;
    hour_24: number;
  };
  fee_tvl_ratio: {
    min_30: number;
    hour_1: number;
    hour_2: number;
    hour_4: number;
    hour_12: number;
    hour_24: number;
  };
  volume: {
    min_30: number;
    hour_1: number;
    hour_2: number;
    hour_4: number;
    hour_12: number;
    hour_24: number;
  };
  tags: string[];
} 