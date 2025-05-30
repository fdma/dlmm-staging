export interface TokenMetadata {
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

export interface TokenMetadataResponse {
  success: boolean;
  data?: { [key: string]: TokenMetadata };
  error?: string;
} 