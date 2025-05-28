import { Pool, AnalyzedPool } from '../types/pool';

export function analyzePools(pools: Pool[]): AnalyzedPool[] {
  return pools
    .map(pool => {
      const liquidityValue = parseFloat(pool.liquidity);
      const hourlyVolume = pool.volume.hour_1;
      
      if (!liquidityValue || !hourlyVolume) return null;

      const volumeLiquidityRatio = hourlyVolume / liquidityValue;
      
      return {
        ...pool,
        volumeLiquidityRatio,
        hourlyVolume,
        liquidityValue
      };
    })
    .filter((pool): pool is AnalyzedPool => 
      pool !== null && pool.volumeLiquidityRatio >= 1
    )
    .sort((a, b) => b.volumeLiquidityRatio - a.volumeLiquidityRatio);
} 
