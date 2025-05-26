import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { MeteoraPair } from '@/types/pool';

const METEORA_API = 'https://dlmm-api.meteora.ag';
const MIN_LIQUIDITY = 30000; // Минимальная ликвидность в USD
const MAX_LIQUIDITY = 100000; // Максимальная ликвидность в USD
const MIN_HOURLY_VOLUME = 5000; // Минимальный объем за час в USD
const MIN_VOLUME_LIQUIDITY_RATIO = 0.5; // Минимальное соотношение объема к ликвидности

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeteoraPair[] | { error: string }>
) {
  try {
    const response = await axios.get<MeteoraPair[]>(`${METEORA_API}/pair/all`);
    
    // Фильтруем пулы
    const profitablePools = response.data.filter(pool => {
      // Исключаем скрытые и заблокированные пулы
      if (pool.hide || pool.is_blacklisted) return false;
      
      const liquidityValue = parseFloat(pool.liquidity);
      const hourlyVolume = pool.volume.hour_1;
      
      // Проверяем ликвидность (должна быть между MIN и MAX)
      if (liquidityValue < MIN_LIQUIDITY || liquidityValue > MAX_LIQUIDITY) return false;
      
      // Проверяем объем за час
      if (!hourlyVolume || hourlyVolume < MIN_HOURLY_VOLUME) return false;
      
      // Проверяем соотношение объема к ликвидности
      const volumeLiquidityRatio = hourlyVolume / liquidityValue;
      if (volumeLiquidityRatio < MIN_VOLUME_LIQUIDITY_RATIO) return false;
      
      return true;
    });

    // Сортируем пулы по соотношению объема к ликвидности (по убыванию)
    profitablePools.sort((a, b) => {
      const ratioA = a.volume.hour_1 / parseFloat(a.liquidity);
      const ratioB = b.volume.hour_1 / parseFloat(b.liquidity);
      return ratioB - ratioA;
    });

    res.status(200).json(profitablePools);
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
} 