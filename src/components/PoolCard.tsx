"use client";

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import type { MeteoraPair } from '@/types/pool';
import type { TokenMetadata } from '@/types/token';
import AprChart from './charts/AprChart';
import VolumeChart from './charts/VolumeChart';
import AnimatedCounter from './AnimatedCounter';

interface PoolCardProps {
  pool: MeteoraPair;
  tokenMetadata?: { [key: string]: TokenMetadata };
}

const PoolCard = memo(({ pool, tokenMetadata }: PoolCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const renderSocialLinks = useCallback((token: TokenMetadata) => {
    if (!token.social) return null;

    return (
      <div className="flex space-x-2 mt-2">
        {token.social.telegram && (
          <a
            href={token.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300"
          >
            Telegram
          </a>
        )}
        {token.social.twitter && (
          <a
            href={token.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300"
          >
            Twitter
          </a>
        )}
        {token.social.discord && (
          <a
            href={token.social.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300"
          >
            Discord
          </a>
        )}
      </div>
    );
  }, []);

  const tokenX = tokenMetadata?.[pool.mint_x];
  const tokenY = tokenMetadata?.[pool.mint_y];

  return (
    <div className="bg-primary-900/50 backdrop-blur-sm rounded-lg border border-primary-800/50 p-4 transition-all duration-300 hover:border-primary-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {tokenX?.logoURI && (
            <div className="relative w-8 h-8">
              <Image
                src={tokenX.logoURI}
                alt={tokenX.symbol}
                width={32}
                height={32}
                className="rounded-full"
                loading="lazy"
              />
            </div>
          )}
          {tokenY?.logoURI && (
            <div className="relative w-8 h-8">
              <Image
                src={tokenY.logoURI}
                alt={tokenY.symbol}
                width={32}
                height={32}
                className="rounded-full"
                loading="lazy"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-primary-100">
              {tokenX?.symbol}/{tokenY?.symbol}
            </h3>
            <p className="text-sm text-primary-400">
              {parseFloat(pool.liquidity).toLocaleString()} TVL
            </p>
          </div>
        </div>
        <button
          onClick={handleExpand}
          className="text-primary-400 hover:text-primary-300 transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-primary-400">APR</p>
          <p className="text-lg font-medium text-accent-blue">
            <AnimatedCounter value={pool.apr} suffix="%" />
          </p>
          <AprChart data={pool.aprHistory} />
        </div>
        <div>
          <p className="text-sm text-primary-400">Volume (24h)</p>
          <p className="text-lg font-medium text-accent-green">
            ${pool.volume24h.toLocaleString()}
          </p>
          <VolumeChart data={pool.volumeHistory} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-primary-400">Pool Address</p>
            <div className="flex items-center space-x-2">
              <code className="text-sm text-primary-300">{pool.address}</code>
              <button
                onClick={() => copyToClipboard(pool.address)}
                className="text-primary-400 hover:text-primary-300"
              >
                {copiedAddress === pool.address ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {tokenX && (
            <div>
              <p className="text-sm text-primary-400">{tokenX.symbol} Info</p>
              <p className="text-sm text-primary-300">{tokenX.name}</p>
              {tokenX.description && (
                <p className="text-sm text-primary-400 mt-1">{tokenX.description}</p>
              )}
              {renderSocialLinks(tokenX)}
            </div>
          )}

          {tokenY && (
            <div>
              <p className="text-sm text-primary-400">{tokenY.symbol} Info</p>
              <p className="text-sm text-primary-300">{tokenY.name}</p>
              {tokenY.description && (
                <p className="text-sm text-primary-400 mt-1">{tokenY.description}</p>
              )}
              {renderSocialLinks(tokenY)}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PoolCard.displayName = 'PoolCard';

export default PoolCard; 