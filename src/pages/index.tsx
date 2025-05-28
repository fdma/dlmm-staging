import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import type { MeteoraPair } from '@/types/pool';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedCounter from '@/components/AnimatedCounter';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
const STATS_REFRESH_INTERVAL = 10000; // 10 seconds
const PRICE_REFRESH_INTERVAL = 5000; // 5 seconds
const MIN_LIQUIDITY = 30000; // $30,000
const MAX_LIQUIDITY = 100000; // $100,000
const MIN_VOLUME_LIQUIDITY_RATIO = 0.5; // 0.5x volume/liquidity ratio

interface AprDataPoint {
  timestamp: number;
  apr: number;
}

interface VolumeDataPoint {
  timestamp: number;
  volume: number;
}

interface VolumeTrend {
  isGrowing: boolean;
  percentageChange: number;
  message: string;
}

// Добавляем типы для категоризации пулов
type PoolCategory = 'sol-memecoins' | 'sol-stables' | 'other';

interface CategorizedPools {
  'sol-memecoins': MeteoraPair[];
  'sol-stables': MeteoraPair[];
  'other': MeteoraPair[];
}

interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  description?: string;
  websites?: string[];
  social?: {
    telegram?: string;
    twitter?: string;
    discord?: string;
  };
  gt_score?: number;
  holders_count?: number;
}

interface TokenMetadataResponse {
  success: boolean;
  data?: { [key: string]: TokenMetadata };
  error?: string;
}

// Обновляем типы для API Jupiter
interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      type: string;
      price: string;
    };
  };
  timeTaken: number;
}

// Функция для определения категории пула
const getPoolCategory = (pool: MeteoraPair): PoolCategory => {
  const isSolPair = pool.mint_x === 'So11111111111111111111111111111111111111112' ||
    pool.mint_y === 'So11111111111111111111111111111111111111112';

  if (!isSolPair) return 'other';

  const stablecoins = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX', // USDH
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  ];

  const otherMint = pool.mint_x === 'So11111111111111111111111111111111111111112' ? pool.mint_y : pool.mint_x;

  if (stablecoins.includes(otherMint)) {
    return 'sol-stables';
  }

  return 'sol-memecoins';
};

const AprChart = ({ data }: { data: AprDataPoint[] }) => {
  return (
    <div className="h-24 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="aprGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            hide={true}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            hide={true}
            domain={['auto', 'auto']}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-primary-800/90 backdrop-blur-sm p-2 rounded-lg border border-primary-700/50 shadow-lg">
                    <p className="text-xs text-primary-200">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-medium text-accent-blue">
                      APR: {data.apr.toFixed(2)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="apr"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const VolumeChart = ({ data }: { data: VolumeDataPoint[] }) => {
  return (
    <div className="h-24 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            hide={true}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            hide={true}
            domain={['auto', 'auto']}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-primary-800/90 backdrop-blur-sm p-2 rounded-lg border border-primary-700/50 shadow-lg">
                    <p className="text-xs text-primary-200">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-medium text-accent-green">
                      Volume: ${data.volume.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ModalAprChart = ({ data }: { data: AprDataPoint[] }) => {
  // Вычисляем статистику для APR
  const currentApr = data[data.length - 1]?.apr || 0;
  const previousApr = data[data.length - 2]?.apr || 0;
  const aprChange = ((currentApr - previousApr) / previousApr) * 100;
  const avgApr = data.reduce((sum, point) => sum + point.apr, 0) / data.length;

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="aprGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              hide={true}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              hide={true}
              domain={['auto', 'auto']}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-primary-800/90 backdrop-blur-sm p-2 rounded-lg border border-primary-700/50 shadow-lg">
                      <p className="text-xs text-primary-200">
                        {new Date(data.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-medium text-accent-blue">
                        APR: {data.apr.toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="apr"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Статистика под графиком */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-blue/20">
          <div className="text-sm text-primary-300 mb-1">Current APR</div>
          <div className="text-xl text-accent-blue font-medium">{currentApr.toFixed(2)}%</div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-blue/20">
          <div className="text-sm text-primary-300 mb-1">Change</div>
          <div className={`text-xl font-medium ${aprChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {aprChange >= 0 ? '+' : ''}{aprChange.toFixed(2)}%
          </div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-blue/20">
          <div className="text-sm text-primary-300 mb-1">Average APR</div>
          <div className="text-xl text-accent-blue font-medium">{avgApr.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
};

const ModalVolumeChart = ({ data }: { data: VolumeDataPoint[] }) => {
  // Вычисляем статистику для Volume
  const currentVolume = data[data.length - 1]?.volume || 0;
  const previousVolume = data[data.length - 2]?.volume || 0;
  const volumeChange = ((currentVolume - previousVolume) / previousVolume) * 100;
  const avgVolume = data.reduce((sum, point) => sum + point.volume, 0) / data.length;

  // Форматируем большие числа
  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              hide={true}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              hide={true}
              domain={['auto', 'auto']}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-primary-800/90 backdrop-blur-sm p-2 rounded-lg border border-primary-700/50 shadow-lg">
                      <p className="text-xs text-primary-200">
                        {new Date(data.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-medium text-accent-green">
                        Volume: {formatNumber(data.volume)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Статистика под графиком */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-green/20">
          <div className="text-sm text-primary-300 mb-1">Current Volume</div>
          <div className="text-xl text-accent-green font-medium">{formatNumber(currentVolume)}</div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-green/20">
          <div className="text-sm text-primary-300 mb-1">Change</div>
          <div className={`text-xl font-medium ${volumeChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {volumeChange >= 0 ? '+' : ''}{volumeChange.toFixed(2)}%
          </div>
        </div>
        <div className="bg-primary-800/30 rounded-lg p-3 border border-accent-green/20">
          <div className="text-sm text-primary-300 mb-1">Average Volume</div>
          <div className="text-xl text-accent-green font-medium">{formatNumber(avgVolume)}</div>
        </div>
      </div>
    </div>
  );
};

const PoolCard = ({ pool }: { pool: MeteoraPair }) => {
  const [copied, setCopied] = useState(false);
  const [copiedMintX, setCopiedMintX] = useState(false);
  const [copiedMintY, setCopiedMintY] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [stats, setStats] = useState<MeteoraPair>(pool);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<{
    [key: string]: TokenMetadata;
  }>({});
  const [aprHistory, setAprHistory] = useState<AprDataPoint[]>(() => {
    // Загружаем историю APR из localStorage при инициализации
    const saved = localStorage.getItem(`apr-history-${pool.address}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Проверяем, что данные не старше 10 минут
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        return parsed.filter((point: AprDataPoint) => point.timestamp >= tenMinutesAgo);
      } catch (e) {
        console.error('Error parsing saved APR history:', e);
      }
    }
    return [{
      timestamp: Date.now(),
      apr: pool.apr
    }];
  });
  const [volumeHistory, setVolumeHistory] = useState<VolumeDataPoint[]>(() => {
    // Загружаем историю объемов из localStorage при инициализации
    const saved = localStorage.getItem(`volume-history-${pool.address}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Проверяем, что данные не старше 10 минут
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        return parsed.filter((point: VolumeDataPoint) => point.timestamp >= tenMinutesAgo);
      } catch (e) {
        console.error('Error parsing saved volume history:', e);
      }
    }
    return [{
      timestamp: Date.now(),
      volume: pool.volume.hour_1
    }];
  });
  const [volumeTrend, setVolumeTrend] = useState<VolumeTrend | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const analyzeVolumeTrend = useCallback((currentVolume: number, history: VolumeDataPoint[]) => {
    if (history.length < 2) return null;

    // Получаем последние два значения (текущее и предыдущее)
    const [previous, current] = history.slice(-2);

    // Вычисляем изменение в процентах
    const percentageChange = ((current.volume - previous.volume) / previous.volume) * 100;
    const threshold = 5; // 5% изменение считается значительным

    if (Math.abs(percentageChange) < threshold) return null;

    return {
      isGrowing: percentageChange > 0,
      percentageChange: Math.abs(percentageChange),
      message: percentageChange > 0
        ? `Объемы растут +${percentageChange.toFixed(1)}%`
        : `Объемы падают -${Math.abs(percentageChange).toFixed(1)}%`
    };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!pool.address) return;

    try {
      const { data } = await axios.get<MeteoraPair>(`/api/pair/${pool.address}`);

      const now = Date.now();
      const currentVolume = data.volume.hour_1;

      // Обновляем историю объемов
      setVolumeHistory(prev => {
        const newHistory = [...prev, { timestamp: now, volume: currentVolume }].slice(-10);
        return newHistory;
      });

      // Обновляем историю APR
      setAprHistory(prev => {
        const newPoint = {
          timestamp: now,
          apr: data.apr
        };
        return [...prev, newPoint].slice(-10);
      });

      setStats(data);
      setError(null);
    } catch (err) {
      console.error(`Error fetching stats for pool ${pool.address}:`, err);
      setError('Failed to update stats');
    }
  }, [pool.address]);

  // Восстанавливаем интервал обновления
  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, STATS_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  // Сохраняем историю в localStorage при каждом обновлении
  useEffect(() => {
    if (aprHistory.length > 0) {
      localStorage.setItem(`apr-history-${pool.address}`, JSON.stringify(aprHistory));
    }
  }, [aprHistory, pool.address]);

  useEffect(() => {
    if (volumeHistory.length > 0) {
      localStorage.setItem(`volume-history-${pool.address}`, JSON.stringify(volumeHistory));
    }
  }, [volumeHistory, pool.address]);

  // Анализируем тренд объема при каждом обновлении истории
  useEffect(() => {
    const trend = analyzeVolumeTrend(stats.volume.hour_1, volumeHistory);
    setVolumeTrend(trend);
  }, [volumeHistory, stats.volume.hour_1, analyzeVolumeTrend]);

  // Очищаем старые данные при размонтировании компонента
  useEffect(() => {
    return () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

      const savedApr = localStorage.getItem(`apr-history-${pool.address}`);
      if (savedApr) {
        try {
          const parsed = JSON.parse(savedApr);
          const filtered = parsed.filter((point: AprDataPoint) => point.timestamp >= tenMinutesAgo);
          localStorage.setItem(`apr-history-${pool.address}`, JSON.stringify(filtered));
        } catch (e) {
          console.error('Error cleaning up APR history:', e);
        }
      }

      const savedVolume = localStorage.getItem(`volume-history-${pool.address}`);
      if (savedVolume) {
        try {
          const parsed = JSON.parse(savedVolume);
          const filtered = parsed.filter((point: VolumeDataPoint) => point.timestamp >= tenMinutesAgo);
          localStorage.setItem(`volume-history-${pool.address}`, JSON.stringify(filtered));
        } catch (e) {
          console.error('Error cleaning up volume history:', e);
        }
      }
    };
  }, [pool.address]);

  const copyToClipboard = async (text: string, setCopiedState: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setCopiedState(false), 200);
      }, 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const liquidityValue = parseFloat(stats.liquidity);
  const hourlyVolume = stats.volume.hour_1;
  const volumeLiquidityRatio = hourlyVolume / liquidityValue;

  // Функция для получения метаданных токенов
  const fetchTokenMetadata = useCallback(async (addresses: string[]) => {
    try {
      const response = await axios.get<TokenMetadataResponse>(`/api/token-metadata?addresses=${addresses.join(',')}`);
      if (response.data.success && response.data.data) {
        setTokenMetadata(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching token metadata:', err);
    }
  }, []);

  // Загружаем метаданные токенов при монтировании компонента
  useEffect(() => {
    const addresses = [pool.mint_x, pool.mint_y].filter(addr => !tokenMetadata[addr]);
    if (addresses.length > 0) {
      fetchTokenMetadata(addresses);
    }
  }, [pool.mint_x, pool.mint_y, fetchTokenMetadata, tokenMetadata]);

  // Функция для отображения социальных ссылок
  const renderSocialLinks = (token: TokenMetadata) => {
    if (!token.social) return null;

    return (
      <div className="flex items-center space-x-2 mt-1">
        {token.social.telegram && (
          <a
            href={token.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-200 hover:text-accent-blue transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.49.8-.75 3.12-1.36 5.2-2.26 6.24-2.7 2.98-1.24 3.6-1.45 4.01-1.45.09 0 .29.02.42.12.11.08.14.19.16.27.02.07.02.2-.01.33z" />
            </svg>
          </a>
        )}
        {token.social.twitter && (
          <a
            href={token.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-200 hover:text-accent-blue transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
        )}
        {token.social.discord && (
          <a
            href={token.social.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-200 hover:text-accent-blue transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </a>
        )}
      </div>
    );
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  return (
    <>
      <div
        onClick={handleExpand}
        className={`group relative bg-card-bg rounded-xl border border-card-border p-4 
          transition-all duration-500 ease-out cursor-pointer
          hover:scale-[1.02] hover:shadow-xl hover:shadow-accent-blue/5
          hover:border-accent-blue/20 hover:-translate-y-1
          will-change-transform
          sm:p-5`}
      >
        {/* Декоративный градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-green/5 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

        {/* Контент карточки */}
        <div className="relative">
          {/* Верхняя часть карточки */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {/* Token Images with Tooltips */}
                <div className="flex -space-x-2">
                  <div className="relative group/token">
                    <div className="relative w-8 h-8 rounded-full bg-primary-800 border border-accent-blue/20 
                      overflow-hidden flex items-center justify-center">
                      {tokenMetadata[stats.mint_x]?.logoURI ? (
                        <img
                          src={tokenMetadata[stats.mint_x].logoURI}
                          alt={tokenMetadata[stats.mint_x].symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${tokenMetadata[stats.mint_x].symbol}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-accent-blue/10 animate-pulse" />
                      )}
                    </div>
                    {/* Token Tooltip */}
                    {tokenMetadata[stats.mint_x] && (
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-primary-800/95 backdrop-blur-sm 
                        rounded-lg border border-accent-blue/20 shadow-xl shadow-accent-blue/10
                        opacity-0 invisible group-hover/token:opacity-100 group-hover/token:visible
                        transition-all duration-200 z-50">
                        <div className="flex items-center space-x-2 mb-2">
                          {tokenMetadata[stats.mint_x]?.logoURI && (
                            <img
                              src={tokenMetadata[stats.mint_x].logoURI}
                              alt={tokenMetadata[stats.mint_x]?.symbol || 'Token'}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-white">{tokenMetadata[stats.mint_x]?.name || 'Unknown Token'}</h4>
                            <p className="text-xs text-primary-200">{tokenMetadata[stats.mint_x]?.symbol || '???'}</p>
                          </div>
                        </div>
                        {tokenMetadata[stats.mint_x]?.description && (
                          <p className="text-xs text-primary-200 mb-2 line-clamp-2">
                            {tokenMetadata[stats.mint_x]?.description || ''}
                          </p>
                        )}
                        {tokenMetadata[stats.mint_x] && renderSocialLinks(tokenMetadata[stats.mint_x])}
                        {tokenMetadata[stats.mint_x]?.gt_score !== undefined && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-primary-200">GT Score:</span>
                            <span className="text-xs font-medium text-accent-blue">
                              {tokenMetadata[stats.mint_x].gt_score?.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative group/token">
                    <div className="relative w-8 h-8 rounded-full bg-primary-800 border border-accent-blue/20 
                      overflow-hidden flex items-center justify-center">
                      {tokenMetadata[stats.mint_y]?.logoURI ? (
                        <img
                          src={tokenMetadata[stats.mint_y].logoURI}
                          alt={tokenMetadata[stats.mint_y].symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${tokenMetadata[stats.mint_y].symbol}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-accent-blue/10 animate-pulse" />
                      )}
                    </div>
                    {/* Token Tooltip */}
                    {tokenMetadata[stats.mint_y] && (
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-primary-800/95 backdrop-blur-sm 
                        rounded-lg border border-accent-blue/20 shadow-xl shadow-accent-blue/10
                        opacity-0 invisible group-hover/token:opacity-100 group-hover/token:visible
                        transition-all duration-200 z-50">
                        <div className="flex items-center space-x-2 mb-2">
                          {tokenMetadata[stats.mint_y]?.logoURI && (
                            <img
                              src={tokenMetadata[stats.mint_y].logoURI}
                              alt={tokenMetadata[stats.mint_y]?.symbol || 'Token'}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-white">{tokenMetadata[stats.mint_y]?.name || 'Unknown Token'}</h4>
                            <p className="text-xs text-primary-200">{tokenMetadata[stats.mint_y]?.symbol || '???'}</p>
                          </div>
                        </div>
                        {tokenMetadata[stats.mint_y]?.description && (
                          <p className="text-xs text-primary-200 mb-2 line-clamp-2">
                            {tokenMetadata[stats.mint_y]?.description || ''}
                          </p>
                        )}
                        {tokenMetadata[stats.mint_y] && renderSocialLinks(tokenMetadata[stats.mint_y])}
                        {tokenMetadata[stats.mint_y]?.gt_score !== undefined && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-primary-200">GT Score:</span>
                            <span className="text-xs font-medium text-accent-blue">
                              {tokenMetadata[stats.mint_y].gt_score?.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-base font-medium text-text-primary font-sans truncate">
                  {stats.name}
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>{stats.mint_x.slice(0, 4)}...{stats.mint_x.slice(-4)}</span>
                <span className="text-text-muted">/</span>
                <span>{stats.mint_y.slice(0, 4)}...{stats.mint_y.slice(-4)}</span>
              </div>
              <div className={`
              px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
              flex items-center space-x-1 transform group-hover:scale-105 transition-transform duration-500
              ${volumeLiquidityRatio >= 2
                  ? 'bg-accent-green/10 text-accent-green'
                  : volumeLiquidityRatio >= 1
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'bg-text-muted/10 text-text-muted'}
            `}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{volumeLiquidityRatio.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="space-y-3 mb-4">
            {error && (
              <div className="text-accent-red text-sm p-2 rounded-lg bg-accent-red/10">
                {error}
              </div>
            )}

            {volumeTrend && (
              <div className={`text-sm p-2 rounded-lg flex items-center space-x-2 ${volumeTrend.isGrowing
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'bg-accent-red/10 text-accent-red'
                }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {volumeTrend.isGrowing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  )}
                </svg>
                <span>{volumeTrend.message}</span>
              </div>
            )}

            {/* Volume с графиком */}
            <div className="flex flex-col p-2 rounded-lg bg-primary-50/50 
              transform group-hover:scale-[1.01] transition-transform duration-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-text-secondary">Volume (1h)</span>
                </div>
                <AnimatedCounter
                  value={stats.volume.hour_1}
                  prefix="$"
                  decimals={0}
                  className="font-medium text-text-primary"
                />
              </div>

              {volumeHistory.length > 1 && (
                <VolumeChart data={volumeHistory} />
              )}
            </div>

            {/* APR с графиком */}
            <div className="flex flex-col p-2 rounded-lg bg-primary-50/50 
              transform group-hover:scale-[1.01] transition-transform duration-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-text-secondary">APR</span>
                </div>
                <AnimatedCounter
                  value={stats.apr}
                  suffix="%"
                  decimals={2}
                  className="font-medium text-text-primary"
                />
              </div>

              {aprHistory.length > 1 && (
                <AprChart data={aprHistory} />
              )}
            </div>

            {/* Остальные метрики */}
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-primary-50/50 
              transform group-hover:scale-[1.01] transition-transform duration-500">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-text-secondary">Liquidity</span>
              </div>
              <AnimatedCounter
                value={parseFloat(stats.liquidity)}
                prefix="$"
                decimals={0}
                className="font-medium text-text-primary"
              />
            </div>

            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-primary-50/50 
              transform group-hover:scale-[1.01] transition-transform duration-500">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-text-secondary">24h Volume</span>
              </div>
              <AnimatedCounter
                value={stats.trade_volume_24h}
                prefix="$"
                decimals={0}
                className="font-medium text-text-primary"
              />
            </div>
          </div>

          {/* Удаляем кнопку Meteora из карточки */}
          <div className="relative mt-4 pt-4 border-t border-card-border">
            {/* Пустой div для сохранения отступов */}
          </div>
        </div>
      </div>

      {/* Модальное окно с детальной информацией о пуле */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
          {/* Затемненный фон с размытием */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-primary-900/95 to-primary-950/95 backdrop-blur-xl transition-opacity duration-300"
            onClick={() => setIsExpanded(false)}
          />

          {/* Контент модального окна */}
          <div
            className="relative w-full max-w-4xl bg-gradient-to-br from-primary-800/40 to-primary-900/40 
              rounded-2xl border border-accent-blue/20 shadow-2xl shadow-accent-blue/20 
              backdrop-blur-xl transform transition-all duration-300 animate-modal-enter"
            onClick={e => e.stopPropagation()}
          >
            {/* Декоративные элементы */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-green/5 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-blue/10 via-transparent to-transparent" />

            {/* Заголовок */}
            <div className="relative flex items-center justify-between p-4 border-b border-accent-blue/10">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-accent-blue/10 rounded-lg">
                  <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">{stats.name}</h2>
                  <div className="flex items-center space-x-2 text-xs text-primary-200">
                    <span>{stats.mint_x.slice(0, 4)}...{stats.mint_x.slice(-4)}</span>
                    <span>/</span>
                    <span>{stats.mint_y.slice(0, 4)}...{stats.mint_y.slice(-4)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-primary-200 hover:text-white rounded-lg
                  hover:bg-accent-blue/10 transition-all duration-200
                  hover:shadow-lg hover:shadow-accent-blue/10
                  border border-transparent hover:border-accent-blue/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Основной контент */}
            <div className="relative p-4 space-y-4">
              {/* Секция Overview */}
              <section className="space-y-3">
                <h3 className="text-base font-medium text-white flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Overview</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* APR Chart */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-blue/20">
                    <h4 className="text-sm text-white font-medium mb-2">APR History</h4>
                    {aprHistory.length > 1 && (
                      <ModalAprChart data={aprHistory} />
                    )}
                  </div>

                  {/* Volume Chart */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-green/20">
                    <h4 className="text-sm text-white font-medium mb-2">Volume History</h4>
                    {volumeHistory.length > 1 && (
                      <ModalVolumeChart data={volumeHistory} />
                    )}
                  </div>
                </div>
              </section>

              {/* Секция Metrics */}
              <section className="space-y-3">
                <h3 className="text-base font-medium text-white flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Pool Metrics</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Volume */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-blue/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-accent-blue/10 rounded-lg">
                        <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h4 className="text-sm text-white font-medium">Volume (1h)</h4>
                    </div>
                    <AnimatedCounter
                      value={stats.volume.hour_1}
                      prefix="$"
                      decimals={0}
                      className="text-base font-medium text-white"
                    />
                  </div>

                  {/* APR */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-green/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-accent-green/10 rounded-lg">
                        <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm text-white font-medium">APR</h4>
                    </div>
                    <AnimatedCounter
                      value={stats.apr}
                      suffix="%"
                      decimals={2}
                      className="text-base font-medium text-white"
                    />
                  </div>

                  {/* Liquidity */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-blue/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-accent-blue/10 rounded-lg">
                        <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm text-white font-medium">Liquidity</h4>
                    </div>
                    <AnimatedCounter
                      value={parseFloat(stats.liquidity)}
                      prefix="$"
                      decimals={0}
                      className="text-base font-medium text-white"
                    />
                  </div>

                  {/* 24h Volume */}
                  <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-green/20">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-accent-green/10 rounded-lg">
                        <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-sm text-white font-medium">24h Volume</h4>
                    </div>
                    <AnimatedCounter
                      value={stats.trade_volume_24h}
                      prefix="$"
                      decimals={0}
                      className="text-base font-medium text-white"
                    />
                  </div>
                </div>
              </section>

              {/* Секция Token Information */}
              <section className="space-y-3">
                <h3 className="text-base font-medium text-white flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Token Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Token X */}
                  {tokenMetadata[stats.mint_x] && (
                    <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-blue/20">
                      <div className="flex items-center space-x-2 mb-1">
                        {tokenMetadata[stats.mint_x].logoURI && (
                          <img
                            src={tokenMetadata[stats.mint_x].logoURI}
                            alt={tokenMetadata[stats.mint_x].symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-white">{tokenMetadata[stats.mint_x].name}</h4>
                          <p className="text-xs text-primary-200">{tokenMetadata[stats.mint_x].symbol}</p>
                        </div>
                      </div>
                      {tokenMetadata[stats.mint_x].description && (
                        <p className="text-xs text-primary-200 mb-1 line-clamp-2">{tokenMetadata[stats.mint_x].description}</p>
                      )}
                      {tokenMetadata[stats.mint_x].social && renderSocialLinks(tokenMetadata[stats.mint_x])}
                    </div>
                  )}

                  {/* Token Y */}
                  {tokenMetadata[stats.mint_y] && (
                    <div className="bg-primary-800/30 rounded-xl p-3 border border-accent-green/20">
                      <div className="flex items-center space-x-2 mb-1">
                        {tokenMetadata[stats.mint_y].logoURI && (
                          <img
                            src={tokenMetadata[stats.mint_y].logoURI}
                            alt={tokenMetadata[stats.mint_y].symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-white">{tokenMetadata[stats.mint_y].name}</h4>
                          <p className="text-xs text-primary-200">{tokenMetadata[stats.mint_y].symbol}</p>
                        </div>
                      </div>
                      {tokenMetadata[stats.mint_y].description && (
                        <p className="text-xs text-primary-200 mb-1 line-clamp-2">{tokenMetadata[stats.mint_y].description}</p>
                      )}
                      {tokenMetadata[stats.mint_y].social && renderSocialLinks(tokenMetadata[stats.mint_y])}
                    </div>
                  )}
                </div>
              </section>

              {/* Секция с кнопками */}
              <section className="space-y-3">
                <h3 className="text-base font-medium text-white flex items-center space-x-2">
                  <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>External Links</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://app.meteora.ag/dlmm/${stats.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/10 
                      hover:bg-accent-blue/20 border border-accent-blue/20 hover:border-accent-blue/30
                      text-accent-blue hover:text-white transition-all duration-200
                      hover:shadow-lg hover:shadow-accent-blue/10 text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Meteora</span>
                  </a>
                  <a
                    href={`https://dexscreener.com/solana/${stats.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent-green/10 
                      hover:bg-accent-green/20 border border-accent-green/20 hover:border-accent-green/30
                      text-accent-green hover:text-white transition-all duration-200
                      hover:shadow-lg hover:shadow-accent-green/10"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Dexscreener</span>
                  </a>
                  <div className="flex gap-2">
                    <a
                      href={`https://gmgn.ai/sol/token/${stats.mint_x}?chain=sol`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-800/50 
                        hover:bg-primary-700/50 border border-primary-700/50 hover:border-accent-blue/50
                        text-primary-200 hover:text-white transition-all duration-200
                        hover:shadow-lg hover:shadow-accent-blue/10"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>GMGN {tokenMetadata[stats.mint_x]?.symbol || 'Token 1'}</span>
                    </a>
                    <a
                      href={`https://gmgn.ai/sol/token/${stats.mint_y}?chain=sol`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-800/50 
                        hover:bg-primary-700/50 border border-primary-700/50 hover:border-accent-blue/50
                        text-primary-200 hover:text-white transition-all duration-200
                        hover:shadow-lg hover:shadow-accent-blue/10"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>GMGN {tokenMetadata[stats.mint_y]?.symbol || 'Token 2'}</span>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Documentation: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемненный фон с размытием */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary-900/95 to-primary-950/95 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Контент документации */}
      <div
        className="relative w-full max-w-4xl bg-gradient-to-br from-primary-800/40 to-primary-900/40 
          rounded-2xl border border-accent-blue/20 shadow-2xl shadow-accent-blue/20 
          backdrop-blur-xl transform transition-all duration-300 animate-modal-enter
          overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-green/5 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-blue/10 via-transparent to-transparent" />

        {/* Заголовок */}
        <div className="relative flex items-center justify-between p-6 border-b border-accent-blue/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-blue/10 rounded-lg animate-float">
              <svg className="w-6 h-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">DLMM Observer Documentation</h2>
              <p className="text-sm text-primary-200">Your guide to Meteora DLMM pools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-primary-200 hover:text-white rounded-lg
              hover:bg-accent-blue/10 transition-all duration-200
              hover:shadow-lg hover:shadow-accent-blue/10
              border border-transparent hover:border-accent-blue/20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Основной контент */}
        <div className="relative p-6 space-y-8">
          {/* Overview Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
              <div className="p-2 bg-accent-blue/10 rounded-lg">
                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Overview</span>
            </h3>
            <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-blue/20">
              <p className="text-primary-200 leading-relaxed">
                DLMM Observer is a real-time monitoring tool for Meteora DLMM (Dynamic Liquidity Market Maker) pools on Solana.
                It provides comprehensive analytics, volume tracking, and APR monitoring for liquidity providers and traders.
              </p>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span>Key Features</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-blue/20 
                hover:border-accent-blue/30 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Real-time Monitoring</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Track pool metrics, volume, and APR in real-time with automatic updates every 30 seconds.
                </p>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-green/20 
                hover:border-accent-green/30 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Volume Analytics</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Analyze trading volume trends and liquidity ratios to identify the most active pools.
                </p>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-blue/20 
                hover:border-accent-blue/30 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">APR Tracking</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Monitor APR changes and historical performance to optimize your yield farming strategy.
                </p>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-green/20 
                hover:border-accent-green/30 transition-colors duration-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Token Information</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Access detailed token information, including social links, descriptions, and market data.
                </p>
              </div>
            </div>
          </section>

          {/* Pool Categories Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
              <div className="p-2 bg-accent-blue/10 rounded-lg">
                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span>Pool Categories</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-blue/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">SOL/Memecoins</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Pools pairing SOL with popular meme tokens, offering high volatility and potential returns.
                </p>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-green/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">SOL/Stables</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Pools pairing SOL with stablecoins, providing lower risk and consistent trading opportunities.
                </p>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-primary-700/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-primary-700/50 rounded-lg">
                    <svg className="w-5 h-5 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Other Pools</h4>
                </div>
                <p className="text-sm text-primary-200">
                  Additional pools with various token pairs, offering diverse trading opportunities.
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Key Metrics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-blue/20">
                <h4 className="text-white font-medium mb-2">Volume/Liquidity Ratio</h4>
                <ul className="text-sm text-primary-200 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                    <span>≥ 2x: High trading activity</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                    <span>1x - 2x: Moderate activity</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-text-muted"></span>
                    <span>&lt; 1x: Low activity</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary-800/30 rounded-xl p-4 border border-accent-green/20">
                <h4 className="text-white font-medium mb-2">Pool Requirements</h4>
                <ul className="text-sm text-primary-200 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                    <span>Minimum liquidity: $30,000</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                    <span>Maximum liquidity: $100,000</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
                    <span>Minimum volume/liquidity ratio: 0.5x</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Обновляем стили для анимаций
const styles = `
  @keyframes modal-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(-5deg);
    }
    50% {
      transform: translateY(-5px) rotate(5deg);
    }
  }

  /* Анимации для карточек */
  .card-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  .card-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms ease-out, transform 300ms ease-out;
  }

  .card-exit {
    opacity: 1;
    transform: translateY(0);
  }

  .card-exit-active {
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 300ms ease-in, transform 300ms ease-in;
  }

  .card-move {
    transition: transform 500ms ease-out;
  }

  .animate-modal-enter {
    animation: modal-enter 0.3s ease-out forwards;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    position: relative;
  }

  @media (min-width: 640px) {
    .card-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .card-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function Home() {
  const [pools, setPools] = useState<MeteoraPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<string | null>(null);
  const [prevSolPrice, setPrevSolPrice] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const [currentPage, setCurrentPage] = useState<Record<PoolCategory, number>>({
    'sol-memecoins': 1,
    'sol-stables': 1,
    'other': 1
  });
  const poolsPerPage = 12;
  const [showDocs, setShowDocs] = useState(false);
  const docsRef = useRef<HTMLDivElement>(null);

  // Функция для получения цены SOL
  const fetchSolPrice = async () => {
    try {
      const { data } = await axios.get<JupiterPriceResponse>('https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
      const solData = data.data['So11111111111111111111111111111111111111112'];
      if (solData) {
        const newPrice = parseFloat(solData.price).toFixed(2);

        if (solPrice) {
          setPrevSolPrice(solPrice);
          const priceDiff = parseFloat(newPrice) - parseFloat(solPrice);
          setPriceChange(priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : null);
        }

        setSolPrice(newPrice);
      }
    } catch (error) {
      console.error('Error fetching SOL price:', error);
    }
  };

  // Получаем цену SOL при монтировании и обновляем каждые 5 секунд
  useEffect(() => {
    fetchSolPrice();
    const intervalId = setInterval(fetchSolPrice, PRICE_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const fetchPools = async () => {
    try {
      const { data } = await axios.get<MeteoraPair[]>('/api/profitable-pools');
      setPools(data);
    } catch (error) {
      console.error('Error fetching pools:', error);
      setError('Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
    const intervalId = setInterval(fetchPools, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  // Закрываем документацию при клике вне её
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (docsRef.current && !docsRef.current.contains(event.target as Node)) {
        setShowDocs(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Функция для категоризации пулов
  const categorizedPools: CategorizedPools = pools.reduce((acc, pool) => {
    const category = getPoolCategory(pool);
    acc[category].push(pool);
    return acc;
  }, {
    'sol-memecoins': [],
    'sol-stables': [],
    'other': []
  } as CategorizedPools);

  // Получаем текущие пулы для каждой категории
  const getCurrentPools = (category: PoolCategory) => {
    const categoryPools = categorizedPools[category];
    const startIndex = (currentPage[category] - 1) * poolsPerPage;
    const endIndex = startIndex + poolsPerPage;
    return categoryPools.slice(startIndex, endIndex);
  };

  // Получаем общее количество страниц для каждой категории
  const getTotalPages = (category: PoolCategory) => {
    return Math.ceil(categorizedPools[category].length / poolsPerPage);
  };

  const handlePageChange = (category: PoolCategory, pageNumber: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [category]: pageNumber
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center">
        <div className="text-accent-red">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Интегрированный хедер с улучшенным дизайном */}
      <div className="relative overflow-hidden">
        {/* Декоративные элементы фона */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-blue/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-24 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-blue/20 rounded-xl blur-xl group-hover:bg-accent-blue/30 transition-all duration-500" />
                  <div className="relative p-2 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-xl border border-accent-blue/20">
                    <img
                      src="https://i.ibb.co/tTwD8zRm/logo-circle.png"
                      alt="DLMM Observer"
                      className="w-16 h-16 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-125 hover:shadow-xl"
                    />                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-white font-sans tracking-tight">
                    DLMM Observer
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-200 mt-1">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-medium">{pools.length}</span>
                      <span className="text-primary-300">active pools</span>
                    </div>
                    {solPrice && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-primary-800/30 border border-primary-700/30">
                        <div className="relative w-4 h-4">
                          <img
                            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                            alt="SOL"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=SOL&background=random`;
                            }}
                          />
                        </div>
                        <AnimatedCounter
                          value={parseFloat(solPrice)}
                          prefix="$"
                          decimals={2}
                          className={`font-medium ${priceChange === 'up' ? 'text-accent-green' : priceChange === 'down' ? 'text-accent-red' : 'text-accent-blue'}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-auto" ref={docsRef}>
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                {/* Социальные сети */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://t.me/dlmm_scan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-200 hover:text-white rounded-lg 
                      bg-primary-800/50 hover:bg-primary-700/50 border border-primary-700/50
                      hover:border-accent-blue/50 transition-all duration-300
                      hover:shadow-lg hover:shadow-accent-blue/10
                      active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.49.8-.75 3.12-1.36 5.2-2.26 6.24-2.7 2.98-1.24 3.6-1.45 4.01-1.45.09 0 .29.02.42.12.11.08.14.19.16.27.02.07.02.2-.01.33z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/DlmmScan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-200 hover:text-white rounded-lg 
                      bg-primary-800/50 hover:bg-primary-700/50 border border-primary-700/50
                      hover:border-accent-blue/50 transition-all duration-300
                      hover:shadow-lg hover:shadow-accent-blue/10
                      active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>

                {/* Документация */}
                <button
                  onClick={() => setShowDocs(!showDocs)}
                  className="group relative p-2 text-primary-200 hover:text-white rounded-lg 
                    bg-primary-800/50 hover:bg-primary-700/50 border border-primary-700/50
                    hover:border-accent-blue/50 transition-all duration-300
                    hover:shadow-lg hover:shadow-accent-blue/10
                    active:scale-95"
                >
                  <div className="absolute inset-0 bg-accent-blue/10 rounded-lg opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <div className="relative flex items-center space-x-2">
                    <svg className={`w-5 h-5 transition-transform duration-300 ${showDocs ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden md:inline text-sm font-medium">Documentation</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Grid container for SOL/Memecoins and SOL/Stables sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SOL/Memecoins Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <svg className="w-6 h-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-white">SOL/Memecoins Pools</h2>
                  <span className="px-2 py-1 text-sm bg-primary-800/50 rounded-full text-primary-200">
                    {categorizedPools['sol-memecoins'].length} pools
                  </span>
                </div>
              </div>
              <TransitionGroup component="div" className="card-grid">
                {getCurrentPools('sol-memecoins').map((pool) => (
                  <CSSTransition
                    key={pool.address}
                    timeout={300}
                    classNames="card"
                  >
                    <div>
                      <PoolCard pool={pool} />
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
              {getTotalPages('sol-memecoins') > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                  <Pagination
                    currentPage={currentPage['sol-memecoins']}
                    totalPages={getTotalPages('sol-memecoins')}
                    onPageChange={(page) => handlePageChange('sol-memecoins', page)}
                  />
                </div>
              )}
            </section>

            {/* SOL/Stables Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent-green/10 rounded-lg">
                    <svg className="w-6 h-6 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-white">SOL/Stables Pools</h2>
                  <span className="px-2 py-1 text-sm bg-primary-800/50 rounded-full text-primary-200">
                    {categorizedPools['sol-stables'].length} pools
                  </span>
                </div>
              </div>
              <TransitionGroup component="div" className="card-grid">
                {getCurrentPools('sol-stables').map((pool) => (
                  <CSSTransition
                    key={pool.address}
                    timeout={300}
                    classNames="card"
                  >
                    <div>
                      <PoolCard pool={pool} />
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
              {getTotalPages('sol-stables') > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                  <Pagination
                    currentPage={currentPage['sol-stables']}
                    totalPages={getTotalPages('sol-stables')}
                    onPageChange={(page) => handlePageChange('sol-stables', page)}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Remove Other Pools section */}
        </div>
      </main>

      {/* Интегрированный футер с улучшенным дизайном */}
      <div className="relative mt-12 pt-8">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-800/30 border border-primary-700/30">
                <svg className="w-4 h-4 text-accent-green" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm text-primary-200">Protected Pools</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-800/30 border border-primary-700/30">
                <svg className="w-4 h-4 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm text-primary-200">Real-time Data</span>
              </div>
            </div>
            <div className="text-sm text-primary-300/70 hover:text-primary-200 transition-colors duration-200">
              Built by <span className="text-accent-blue">Asanta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Добавляем компонент документации */}
      <Documentation isVisible={showDocs} onClose={() => setShowDocs(false)} />
    </div>
  );
}

// Компонент пагинации
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-primary-800 text-white disabled:opacity-50 
          hover:bg-primary-700 disabled:hover:bg-primary-800 transition-colors"
      >
        Previous
      </button>
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md ${currentPage === page
                ? 'bg-accent-blue text-white'
                : 'bg-primary-800 text-white hover:bg-primary-700'
              } transition-colors`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-primary-800 text-white disabled:opacity-50 
          hover:bg-primary-700 disabled:hover:bg-primary-800 transition-colors"
      >
        Next
      </button>
    </>
  );
}; 