import axios from 'axios';
import { Pool } from './types';

const METEORA_API = 'https://dlmm-api.meteora.ag';

async function getProfitablePools(): Promise<Pool[]> {
  try {
    // Получаем все пулы
    const response = await axios.get<Pool[]>(`${METEORA_API}/pair/all`);
    const pools = response.data;

    // Фильтруем прибыльные пулы
    const profitablePools = pools.filter(pool => {
      const liquidityValue = parseFloat(pool.liquidity);
      const hourlyVolume = pool.volume.hour_1;
      
      // Проверяем, что значения определены и не равны 0
      if (!liquidityValue || !hourlyVolume) return false;
      
      // Вычисляем соотношение
      const volumeToLiquidityRatio = hourlyVolume / liquidityValue;
      
      // Возвращаем true если соотношение >= 1
      return volumeToLiquidityRatio >= 1;
    });

    // Сортируем по убыванию соотношения объём/ликвидность
    return profitablePools.sort((a, b) => {
      const ratioA = a.volume.hour_1 / parseFloat(a.liquidity);
      const ratioB = b.volume.hour_1 / parseFloat(b.liquidity);
      return ratioB - ratioA;
    });

  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
}

// Функция для красивого вывода результатов
function displayProfitablePools(pools: Pool[]) {
  console.log('\nПрибыльные пулы (отсортированы по соотношению объём/ликвидность):\n');
  
  pools.forEach(pool => {
    const liquidityValue = parseFloat(pool.liquidity);
    const hourlyVolume = pool.volume.hour_1;
    const ratio = hourlyVolume / liquidityValue;
    
    console.log(`Пул: ${pool.name}`);
    console.log(`Адрес: ${pool.address}`);
    console.log(`Ликвидность: $${liquidityValue.toLocaleString()}`);
    console.log(`Часовой объём: $${hourlyVolume.toLocaleString()}`);
    console.log(`Соотношение объём/ликвидность: ${ratio.toFixed(2)}`);
    console.log('------------------------\n');
  });
}

// Запускаем
async function main() {
  try {
    const profitablePools = await getProfitablePools();
    displayProfitablePools(profitablePools);
  } catch (error) {
    console.error('Ошибка в main:', error);
  }
}

main(); 