import { useState } from 'react';
import api, { ApiResponse } from '../../../api/api-client';
import { BuyBoxSnapshot, BuyBoxHistory } from '../types/buybox.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export const useBuyBoxApi = () => {
  // Initialize Buy Box monitoring for a product
  const initializeMonitoring = async (
    productId: string,
    marketplaceId: string,
    marketplaceProductId: string,
    monitoringFrequency?: number
  ): Promise<ApiResponse<BuyBoxHistory>> => {
    try {
      const response = await api.post('/buybox/init', {
        productId,
        marketplaceId,
        marketplaceProductId,
        monitoringFrequency
      });
      
      return response.data;
    } catch (error) {
      console.error('API error initializing Buy Box monitoring', error);
      return {
        success: false,
        message: 'Failed to initialize Buy Box monitoring'
      };
    }
  };
  
  // Initialize Buy Box monitoring for all products on a marketplace
  const initializeMonitoringForMarketplace = async (
    marketplaceId: string,
    monitoringFrequency?: number
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/buybox/init-marketplace', {
        marketplaceId,
        monitoringFrequency
      });
      
      return response.data;
    } catch (error) {
      console.error('API error initializing Buy Box monitoring for marketplace', error);
      return {
        success: false,
        message: 'Failed to initialize Buy Box monitoring for marketplace'
      };
    }
  };
  
  // Stop Buy Box monitoring for a product
  const stopMonitoring = async (
    productId: string,
    marketplaceId: string
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/buybox/stop', {
        productId,
        marketplaceId
      });
      
      return response.data;
    } catch (error) {
      console.error('API error stopping Buy Box monitoring', error);
      return {
        success: false,
        message: 'Failed to stop Buy Box monitoring'
      };
    }
  };
  
  // Check Buy Box status for a product
  const checkBuyBoxStatus = async (
    productId: string,
    marketplaceId: string,
    marketplaceProductId: string
  ): Promise<ApiResponse<BuyBoxSnapshot>> => {
    try {
      const response = await api.post('/buybox/check', {
        productId,
        marketplaceId,
        marketplaceProductId
      });
      
      return response.data;
    } catch (error) {
      console.error('API error checking Buy Box status', error);
      return {
        success: false,
        message: 'Failed to check Buy Box status'
      };
    }
  };
  
  // Get Buy Box history for a product
  const getBuyBoxHistory = async (
    productId: string,
    marketplaceId: string
  ): Promise<ApiResponse<BuyBoxHistory>> => {
    try {
      const response = await api.get(`/buybox/history/${productId}/${marketplaceId}`);
      
      return response.data;
    } catch (error) {
      console.error('API error getting Buy Box history', error);
      return {
        success: false,
        message: 'Failed to get Buy Box history'
      };
    }
  };
  
  // Get Buy Box histories for a marketplace
  const getBuyBoxHistoriesByMarketplace = async (
    marketplaceId: string,
    limit?: number,
    startAfter?: string
  ): Promise<ApiResponse<BuyBoxHistory[]>> => {
    try {
      let url = `/buybox/marketplace/${marketplaceId}`;
      const params = new URLSearchParams();
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      if (startAfter) {
        params.append('startAfter', startAfter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      
      return response.data;
    } catch (error) {
      console.error('API error getting Buy Box histories for marketplace', error);
      return {
        success: false,
        message: 'Failed to get Buy Box histories for marketplace'
      };
    }
  };
  
  // Apply repricing rules
  const applyRepricingRules = async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/buybox/apply-rules');
      
      return response.data;
    } catch (error) {
      console.error('API error applying repricing rules', error);
      return {
        success: false,
        message: 'Failed to apply repricing rules'
      };
    }
  };
  
  return {
    initializeMonitoring,
    initializeMonitoringForMarketplace,
    stopMonitoring,
    checkBuyBoxStatus,
    getBuyBoxHistory,
    getBuyBoxHistoriesByMarketplace,
    applyRepricingRules
  };
};