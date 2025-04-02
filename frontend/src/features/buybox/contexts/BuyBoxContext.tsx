import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BuyBoxSnapshot, BuyBoxHistory, BuyBoxOwnershipStatus } from '../types/buybox.types';
import { useBuyBoxApi } from '../api/buybox.api';

interface BuyBoxContextProps {
  // Loading states
  isInitializing: boolean;
  isChecking: boolean;
  isStopping: boolean;
  loading: boolean;
  
  // Data
  buyBoxHistories: BuyBoxHistory[];
  currentProduct?: {
    productId: string;
    marketplaceId: string;
    history?: BuyBoxHistory;
  };
  
  // Methods
  initializeMonitoring: (productId: string, marketplaceId: string, marketplaceProductId: string, monitoringFrequency?: number) => Promise<BuyBoxHistory | null>;
  initializeMonitoringForMarketplace: (marketplaceId: string, monitoringFrequency?: number) => Promise<number>;
  stopMonitoring: (productId: string, marketplaceId: string) => Promise<boolean>;
  checkBuyBoxStatus: (productId: string, marketplaceId: string, marketplaceProductId: string) => Promise<BuyBoxSnapshot | null>;
  getBuyBoxHistory: (productId: string, marketplaceId: string) => Promise<BuyBoxHistory | null>;
  getBuyBoxHistoriesByMarketplace: (marketplaceId: string) => Promise<BuyBoxHistory[]>;
  setCurrentProduct: (productId: string, marketplaceId: string) => void;
  clearCurrentProduct: () => void;
  refreshCurrentProductHistory: () => Promise<void>;
}

const BuyBoxContext = createContext<BuyBoxContextProps | undefined>(undefined);

interface BuyBoxProviderProps {
  children: ReactNode;
}

export function BuyBoxProvider({ children }: BuyBoxProviderProps) {
  const buyBoxApi = useBuyBoxApi();
  
  // State
  const [isInitializing, setIsInitializing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [buyBoxHistories, setBuyBoxHistories] = useState<BuyBoxHistory[]>([]);
  const [currentProduct, setCurrentProductState] = useState<{
    productId: string;
    marketplaceId: string;
    history?: BuyBoxHistory;
  } | undefined>(undefined);
  
  // Initialize monitoring for a single product
  const initializeMonitoring = async (
    productId: string,
    marketplaceId: string,
    marketplaceProductId: string,
    monitoringFrequency?: number
  ): Promise<BuyBoxHistory | null> => {
    try {
      setIsInitializing(true);
      
      const result = await buyBoxApi.initializeMonitoring(
        productId,
        marketplaceId,
        marketplaceProductId,
        monitoringFrequency
      );
      
      if (result && result.data) {
        // Update histories
        setBuyBoxHistories(prev => {
          // Replace if exists, otherwise add
          const exists = prev.some(h => h.id === result.data.id);
          if (exists) {
            return prev.map(h => h.id === result.data.id ? result.data : h);
          } else {
            return [...prev, result.data];
          }
        });
        
        // Update current product if it matches
        if (currentProduct && 
            currentProduct.productId === productId && 
            currentProduct.marketplaceId === marketplaceId) {
          setCurrentProductState({
            ...currentProduct,
            history: result.data
          });
        }
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to initialize Buy Box monitoring', error);
      return null;
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Initialize monitoring for an entire marketplace
  const initializeMonitoringForMarketplace = async (
    marketplaceId: string,
    monitoringFrequency?: number
  ): Promise<number> => {
    try {
      setIsInitializing(true);
      
      const result = await buyBoxApi.initializeMonitoringForMarketplace(
        marketplaceId,
        monitoringFrequency
      );
      
      if (result && result.count) {
        // Refresh histories
        await getBuyBoxHistoriesByMarketplace(marketplaceId);
        
        return result.count;
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to initialize Buy Box monitoring for marketplace', error);
      return 0;
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Stop monitoring
  const stopMonitoring = async (
    productId: string,
    marketplaceId: string
  ): Promise<boolean> => {
    try {
      setIsStopping(true);
      
      const result = await buyBoxApi.stopMonitoring(productId, marketplaceId);
      
      if (result && result.success) {
        // Update histories
        setBuyBoxHistories(prev => prev.map(h => {
          if (h.productId === productId && h.marketplaceId === marketplaceId) {
            return { ...h, isMonitoring: false };
          }
          return h;
        }));
        
        // Update current product if it matches
        if (currentProduct && 
            currentProduct.productId === productId && 
            currentProduct.marketplaceId === marketplaceId &&
            currentProduct.history) {
          setCurrentProductState({
            ...currentProduct,
            history: {
              ...currentProduct.history,
              isMonitoring: false
            }
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to stop Buy Box monitoring', error);
      return false;
    } finally {
      setIsStopping(false);
    }
  };
  
  // Check status
  const checkBuyBoxStatus = async (
    productId: string,
    marketplaceId: string,
    marketplaceProductId: string
  ): Promise<BuyBoxSnapshot | null> => {
    try {
      setIsChecking(true);
      
      const result = await buyBoxApi.checkBuyBoxStatus(
        productId,
        marketplaceId,
        marketplaceProductId
      );
      
      if (result && result.data) {
        // Refresh history
        await getBuyBoxHistory(productId, marketplaceId);
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check Buy Box status', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  };
  
  // Get history
  const getBuyBoxHistory = async (
    productId: string,
    marketplaceId: string
  ): Promise<BuyBoxHistory | null> => {
    try {
      setIsLoading(true);
      
      const result = await buyBoxApi.getBuyBoxHistory(productId, marketplaceId);
      
      if (result && result.data) {
        // Update histories
        setBuyBoxHistories(prev => {
          // Replace if exists, otherwise add
          const exists = prev.some(h => h.id === result.data.id);
          if (exists) {
            return prev.map(h => h.id === result.data.id ? result.data : h);
          } else {
            return [...prev, result.data];
          }
        });
        
        // Update current product if it matches
        if (currentProduct && 
            currentProduct.productId === productId && 
            currentProduct.marketplaceId === marketplaceId) {
          setCurrentProductState({
            ...currentProduct,
            history: result.data
          });
        }
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get Buy Box history', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get histories by marketplace
  const getBuyBoxHistoriesByMarketplace = async (
    marketplaceId: string
  ): Promise<BuyBoxHistory[]> => {
    try {
      setIsLoading(true);
      
      const result = await buyBoxApi.getBuyBoxHistoriesByMarketplace(marketplaceId);
      
      if (result && result.data) {
        // Update histories
        setBuyBoxHistories(prev => {
          // Filter out existing entries for this marketplace
          const filtered = prev.filter(h => h.marketplaceId !== marketplaceId);
          // Add new ones
          return [...filtered, ...result.data];
        });
        
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get Buy Box histories for marketplace', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set current product
  const setCurrentProduct = (productId: string, marketplaceId: string) => {
    // Find in histories
    const history = buyBoxHistories.find(
      h => h.productId === productId && h.marketplaceId === marketplaceId
    );
    
    setCurrentProductState({
      productId,
      marketplaceId,
      history
    });
    
    // If no history found, get it
    if (!history) {
      getBuyBoxHistory(productId, marketplaceId);
    }
  };
  
  // Clear current product
  const clearCurrentProduct = () => {
    setCurrentProductState(undefined);
  };
  
  // Refresh current product history
  const refreshCurrentProductHistory = async (): Promise<void> => {
    if (currentProduct) {
      await getBuyBoxHistory(currentProduct.productId, currentProduct.marketplaceId);
    }
  };
  
  // Context value
  const value: BuyBoxContextProps = {
    isInitializing,
    isChecking,
    isStopping,
    loading,
    buyBoxHistories,
    currentProduct,
    initializeMonitoring,
    initializeMonitoringForMarketplace,
    stopMonitoring,
    checkBuyBoxStatus,
    getBuyBoxHistory,
    getBuyBoxHistoriesByMarketplace,
    setCurrentProduct,
    clearCurrentProduct,
    refreshCurrentProductHistory
  };
  
  return (
    <BuyBoxContext.Provider value={value}>
      {children}
    </BuyBoxContext.Provider>
  );
}

export function useBuyBox() {
  const context = useContext(BuyBoxContext);
  
  if (!context) {
    throw new Error('useBuyBox must be used within a BuyBoxProvider');
  }
  
  return context;
}