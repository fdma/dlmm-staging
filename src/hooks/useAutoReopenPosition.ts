import { useEffect, useCallback, useState, useRef } from 'react';
import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import DLMM, { StrategyType } from '@meteora-ag/dlmm';
import { BN } from '@coral-xyz/anchor';
import debounce from 'lodash/debounce';

// Program ID from DLMM SDK documentation
const DLMM_PROGRAM_ID = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');

// SOL/USDC pool address from Meteora
export const SOL_USDC_POOL = new PublicKey('5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6');

interface UseAutoReopenPositionProps {
  connection: Connection;
  walletPublicKey: PublicKey | null;
}

const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin

export const useAutoReopenPosition = ({ 
  connection,
  walletPublicKey,
}: UseAutoReopenPositionProps) => {
  const [positionData, setPositionData] = useState<{
    activeBin: { binId: number; price: BN; xAmount: BN; yAmount: BN } | null;
    position: any | null;
    error: string | null;
    dlmm: DLMM | null;
    isInitializing: boolean;
    poolAddress: PublicKey | null;
    isSubscribed: boolean;
  }>({
    activeBin: null,
    position: null,
    error: null,
    dlmm: null,
    isInitializing: false,
    poolAddress: SOL_USDC_POOL,
    isSubscribed: false
  });

  const subscriptionRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000; // 5 seconds

  // Debounced pool update handler
  const debouncedHandlePoolUpdate = useCallback(
    debounce((accountInfo: any) => {
      handlePoolUpdate(accountInfo);
    }, 1000),
    [handlePoolUpdate]
  );

  // Initialize DLMM instance
  useEffect(() => {
    const initializeDLMM = async () => {
      if (positionData.isInitializing || !positionData.poolAddress) {
        console.log('Skipping DLMM initialization:', { 
          isInitializing: positionData.isInitializing, 
          poolAddress: positionData.poolAddress?.toString() 
        });
        return;
      }
      
      try {
        setPositionData(prev => ({ ...prev, isInitializing: true, error: null }));
        
        console.log('Initializing DLMM with pool:', positionData.poolAddress.toString());
        const dlmm = await DLMM.create(connection, positionData.poolAddress);
        console.log('DLMM instance created successfully');
        
        // Refetch states to ensure we have latest data
        await dlmm.refetchStates();
        
        setPositionData(prev => ({ 
          ...prev, 
          dlmm, 
          error: null,
          isInitializing: false 
        }));
      } catch (error) {
        console.error('Failed to initialize DLMM:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Detailed error:', {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        setPositionData(prev => ({
          ...prev,
          error: `Failed to initialize pool: ${errorMessage}`,
          isInitializing: false
        }));
      }
    };

    if (connection && !positionData.dlmm && !positionData.isInitializing && positionData.poolAddress) {
      console.log('Starting DLMM initialization...');
      initializeDLMM();
    }
  }, [connection, positionData.dlmm, positionData.isInitializing, positionData.poolAddress]);

  const handlePoolUpdate = useCallback(async (accountInfo: any) => {
    if (!walletPublicKey) {
      console.log('Wallet public key not available');
      setPositionData(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    if (!positionData.dlmm) {
      console.log('DLMM not initialized');
      setPositionData(prev => ({ ...prev, error: 'Pool not initialized' }));
      return;
    }

    try {
      // Refetch states before getting data
      await positionData.dlmm.refetchStates();

      // Get pool state and active bin
      const activeBin = await positionData.dlmm.getActiveBin();
      console.log('Active bin data:', {
        binId: activeBin.binId.toString(),
        price: activeBin.price.toString(),
        xAmount: activeBin.xAmount.toString(),
        yAmount: activeBin.yAmount.toString()
      });

      // Calculate range around active bin
      const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
      const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
      console.log('Position range:', { minBinId, maxBinId, activeBinId: activeBin.binId });

      // Get user positions for this pool
      const { userPositions } = await positionData.dlmm.getPositionsByUserAndLbPair(walletPublicKey);
      console.log('User positions found:', userPositions.length);

      const userPosition = userPositions[0];

      if (!userPosition) {
        console.log('No existing position found, preparing to create new one');
        // If no position exists, prepare data for new position
        const newPosition = new Keypair();
        const totalXAmount = new BN(100 * 10 ** 9); // 100 SOL
        
        // Calculate Y amount based on active bin price
        const totalYAmount = activeBin.xAmount.mul(totalXAmount).div(activeBin.yAmount);

        setPositionData(prev => ({
          ...prev,
          activeBin,
          position: {
            type: 'create',
            positionPubKey: newPosition.publicKey,
            totalXAmount,
            totalYAmount,
            range: { minBinId, maxBinId },
            strategy: {
              maxBinId,
              minBinId,
              strategyType: StrategyType.Spot,
            }
          },
          error: null
        }));
        return;
      }

      // Check if active bin is outside position range
      if (activeBin.binId < userPosition.positionData.lowerBinId || 
          activeBin.binId > userPosition.positionData.upperBinId) {
        console.log('Active bin outside range, preparing rebalance...');

        const currentLiquidity = new BN(userPosition.positionData.totalXAmount)
          .add(new BN(userPosition.positionData.totalYAmount));

        setPositionData(prev => ({
          ...prev,
          activeBin,
          position: {
            type: 'rebalance',
            currentPosition: userPosition,
            newPosition: new Keypair(),
            currentLiquidity,
            range: { minBinId, maxBinId },
            strategy: {
              maxBinId,
              minBinId,
              strategyType: StrategyType.Spot,
            }
          },
          error: null
        }));
        return;
      }

      // Position is in range
      setPositionData(prev => ({
        ...prev,
        activeBin,
        position: {
          type: 'active',
          data: userPosition,
          range: {
            min: userPosition.positionData.lowerBinId,
            max: userPosition.positionData.upperBinId
          }
        },
        error: null
      }));

    } catch (error) {
      console.error('Error in handlePoolUpdate:', error);
      setPositionData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get position data'
      }));
    }
  }, [walletPublicKey, positionData.dlmm]);

  // Subscribe to pool updates with reconnection logic
  const subscribeToPool = useCallback(async () => {
    if (!connection || !walletPublicKey || !positionData.dlmm || !positionData.poolAddress) {
      return;
    }

    try {
      // Initial fetch
      await handlePoolUpdate(null);

      // Subscribe to pool account changes
      const subscriptionId = connection.onAccountChange(
        positionData.poolAddress,
        debouncedHandlePoolUpdate,
        'confirmed'
      );

      subscriptionRef.current = subscriptionId;
      setPositionData(prev => ({ ...prev, isSubscribed: true, error: null }));
      reconnectAttemptsRef.current = 0;

      console.log('Successfully subscribed to pool updates');
    } catch (error) {
      console.error('Failed to subscribe to pool:', error);
      setPositionData(prev => ({
        ...prev,
        error: `Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isSubscribed: false
      }));

      // Attempt to reconnect
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          subscribeToPool();
        }, RECONNECT_DELAY);
      }
    }
  }, [connection, walletPublicKey, positionData.dlmm, positionData.poolAddress, debouncedHandlePoolUpdate]);

  // Cleanup subscription
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current !== null) {
      try {
        connection.removeAccountChangeListener(subscriptionRef.current);
        console.log('Successfully unsubscribed from pool updates');
      } catch (error) {
        console.error('Error unsubscribing from pool:', error);
      }
      subscriptionRef.current = null;
    }

    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setPositionData(prev => ({ ...prev, isSubscribed: false }));
  }, [connection]);

  // Subscribe/unsubscribe effect
  useEffect(() => {
    if (connection && walletPublicKey && positionData.dlmm && positionData.poolAddress) {
      subscribeToPool();
    }

    return () => {
      cleanupSubscription();
    };
  }, [connection, walletPublicKey, positionData.dlmm, positionData.poolAddress, subscribeToPool, cleanupSubscription]);

  return positionData;
}; 