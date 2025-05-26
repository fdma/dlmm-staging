import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface GeckoTerminalTokenResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      image_url: string;
      image: {
        large: string;
        small: string;
        thumb: string;
      };
      coingecko_coin_id: string;
      websites: string[];
      discord_url: string | null;
      telegram_handle: string | null;
      twitter_handle: string | null;
      description: string;
      gt_score: number;
      gt_score_details: {
        pool: number;
        transaction: number;
        creation: number;
        info: number;
        holders: number;
      };
      categories: string[];
      gt_category_ids: string[];
      holders: {
        count: number;
        distribution_percentage: {
          top_10: string;
          "11_20": string;
          "21_40": string;
          rest: string;
        };
        last_updated: string;
      };
      mint_authority: string;
      freeze_authority: string;
    };
  };
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenMetadataResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { addresses } = req.query;

  if (!addresses || typeof addresses !== 'string') {
    return res.status(400).json({ success: false, error: 'Addresses parameter is required' });
  }

  const addressList = addresses.split(',');
  const tokenMap: { [key: string]: TokenMetadata } = {};

  try {
    // Получаем метаданные токенов из GeckoTerminal API
    const promises = addressList.map(async (address) => {
      try {
        const response = await axios.get<GeckoTerminalTokenResponse>(
          `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}/info`
        );

        const tokenData = response.data.data.attributes;
        tokenMap[address] = {
          address: tokenData.address,
          symbol: tokenData.symbol,
          name: tokenData.name,
          decimals: tokenData.decimals,
          logoURI: tokenData.image_url,
          description: tokenData.description,
          websites: tokenData.websites,
          social: {
            telegram: tokenData.telegram_handle ? `https://t.me/${tokenData.telegram_handle}` : undefined,
            twitter: tokenData.twitter_handle ? `https://twitter.com/${tokenData.twitter_handle}` : undefined,
            discord: tokenData.discord_url || undefined,
          },
          gt_score: tokenData.gt_score,
          holders_count: tokenData.holders.count,
        };
      } catch (error) {
        console.warn(`Failed to fetch metadata for token ${address}:`, error);
        // Если не удалось получить данные из GeckoTerminal, используем базовую информацию
        tokenMap[address] = {
          address,
          symbol: 'UNKNOWN',
          name: 'Unknown Token',
          decimals: 9,
          logoURI: `https://ui-avatars.com/api/?name=${address.slice(0, 4)}&background=random`,
        };
      }
    });

    await Promise.all(promises);

    return res.status(200).json({
      success: true,
      data: tokenMap
    });
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch token metadata'
    });
  }
} 