interface VolumeData {
    min_30: number;
    hour_1: number;
    hour_2: number;
    hour_4: number;
    hour_12: number;
    hour_24: number;
  }
  
  interface Pool {
    address: string;
    name: string;
    liquidity: string;
    volume: VolumeData;
    mint_x: string;
    mint_y: string;
    reserve_x_amount: number;
    reserve_y_amount: number;
    current_price: number;
  }
  
  export type { Pool, VolumeData };