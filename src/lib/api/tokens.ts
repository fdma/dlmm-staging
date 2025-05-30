import type { TokenMetadata, TokenMetadataResponse } from '@/types/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.meteora.ag/v1';

export async function fetchTokenMetadata(addresses: string[]): Promise<{ [key: string]: TokenMetadata }> {
  try {
    const response = await fetch(`${API_URL}/tokens/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token metadata');
    }

    const data: TokenMetadataResponse = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch token metadata');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }
} 