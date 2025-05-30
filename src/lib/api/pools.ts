import type { MeteoraPair } from '@/types/pool';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.meteora.ag/v1';

export async function fetchPools(): Promise<MeteoraPair[]> {
  try {
    const response = await fetch(`${API_URL}/pools`);
    if (!response.ok) {
      throw new Error('Failed to fetch pools');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
} 