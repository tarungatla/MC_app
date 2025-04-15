import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FetchOptions {
  cacheKey: string;
  cacheExpiryTime?: number; // in milliseconds
  pageSize?: number;
  params?: Record<string, string | number>;
}

interface FetchState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
}

export function useDataFetching<T>(
  fetchUrl: string,
  options: FetchOptions
) {
  const {
    cacheKey,
    cacheExpiryTime = 5 * 60 * 1000, // 5 minutes default
    pageSize = 10,
    params = {}
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: [],
    loading: true,
    error: null,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    page: 1
  });

  // Load cached data on initial render
  useEffect(() => {
    loadCachedData();
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    if (state.page > 1) {
      fetchData(false);
    }
  }, [state.page]);

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < cacheExpiryTime) {
          setState(prev => ({
            ...prev,
            data,
            loading: false
          }));
          return true;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      return false;
    } catch (error) {
      console.error(`Error loading cached data for ${cacheKey}:`, error);
      return false;
    }
  };

  const cacheData = async (data: T[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Error caching data for ${cacheKey}:`, error);
    }
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setState(prev => ({
        ...prev,
        refreshing: true,
        page: 1
      }));
    } else if (state.page > 1) {
      setState(prev => ({
        ...prev,
        loadingMore: true
      }));
    } else {
      setState(prev => ({
        ...prev,
        loading: true
      }));
    }

    try {
      // Check cache first if not refreshing
      if (!isRefresh && state.page === 1) {
        const hasCachedData = await loadCachedData();
        if (hasCachedData) {
          setState(prev => ({
            ...prev,
            loading: false,
            refreshing: false
          }));
          return;
        }
      }

      // Build URL with query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', state.page.toString());
      queryParams.append('limit', pageSize.toString());
      
      // Add additional params
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });
      
      const url = `${fetchUrl}?${queryParams.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isRefresh || state.page === 1) {
        setState(prev => ({
          ...prev,
          data
        }));
        // Cache the first page of results
        cacheData(data);
      } else {
        setState(prev => ({
          ...prev,
          data: [...prev.data, ...data]
        }));
      }
      
      // Check if we have more data to load
      setState(prev => ({
        ...prev,
        hasMore: data.length === pageSize
      }));
    } catch (err: any) {
      console.error(`Error fetching data for ${cacheKey}:`, err);
      setState(prev => ({
        ...prev,
        error: err.message || "Failed to fetch data."
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        loadingMore: false
      }));
    }
  };

  const refresh = useCallback(() => {
    fetchData(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!state.loadingMore && state.hasMore) {
      setState(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  }, [state.loadingMore, state.hasMore]);

  return {
    ...state,
    refresh,
    loadMore
  };
} 