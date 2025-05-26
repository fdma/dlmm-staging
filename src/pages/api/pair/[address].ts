import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { MeteoraPair } from '@/types/pool';

const METEORA_API = 'https://dlmm-api.meteora.ag';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeteoraPair | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const response = await axios.get<MeteoraPair>(`${METEORA_API}/pair/${address}`);
    
    // Проверяем, что пул не скрыт и не заблокирован
    if (response.data.hide || response.data.is_blacklisted) {
      return res.status(404).json({ error: 'Pool not found' });
    }

    // Устанавливаем заголовки кэширования
    res.setHeader('Cache-Control', 'public, max-age=30'); // кэшируем на 30 секунд
    res.setHeader('Expires', new Date(Date.now() + 30000).toUTCString());
    
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(`Error fetching pool ${address}:`, error);
    
    // Проверяем статус ошибки
    if (error?.response?.status === 404) {
      return res.status(404).json({ error: 'Pool not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch pool data' });
  }
} 