'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MeteoraPair } from '@/types/pool';
import type { TokenMetadata } from '@/types/token';
import PoolCard from '@/components/PoolCard';
import { fetchPools } from '@/lib/api/pools';
import { fetchTokenMetadata } from '@/lib/api/tokens';

export default function PoolsPage() {
  const [tokenMetadata, setTokenMetadata] = useState<{ [key: string]: TokenMetadata }>({});

  const { data: pools, isLoading } = useQuery<MeteoraPair[]>({
    queryKey: ['pools'],
    queryFn: fetchPools,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (pools) {
      const uniqueTokenAddresses = new Set<string>();
      pools.forEach(pool => {
        uniqueTokenAddresses.add(pool.mint_x);
        uniqueTokenAddresses.add(pool.mint_y);
      });

      const fetchMetadata = async () => {
        const metadata = await fetchTokenMetadata(Array.from(uniqueTokenAddresses));
        setTokenMetadata(metadata);
      };

      fetchMetadata();
    }
  }, [pools]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-100 mb-8">Pools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools?.map(pool => (
          <PoolCard
            key={pool.address}
            pool={pool}
            tokenMetadata={tokenMetadata}
          />
        ))}
      </div>
    </div>
  );
} 