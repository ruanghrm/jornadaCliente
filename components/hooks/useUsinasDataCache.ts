// components/hooks/useUsinasDataCache.ts
import { useRef, useCallback } from "react"
import {  
  DeviceSummary, 
  GraphPoint,
  Granularity,
} from "../Usinas/types"
import { StationRealtime } from "../Usinas/types"
import { StationCache, SolplanetInverter, CACHE_DURATION } from "./types"

export function useUsinasDataCache() {
  const cacheRef = useRef<StationCache>({})

  const getFromCache = useCallback(<T>(
    stationId: string,
    type: 'realtime' | 'devices' | 'history' | 'solplanetInverters',
    granularity?: Granularity,
    dateRange?: string
  ): T | null => {
    const cache = cacheRef.current[stationId]
    
    if (!cache) return null

    if (type === 'history' && granularity) {
      const historyCache = cache.history[granularity]
      if (historyCache && dateRange) {
        const cached = historyCache[dateRange]
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION.history) {
          console.log(`📦 Cache HIT: history ${granularity} (${dateRange}) para station ${stationId}`)
          return cached.data as T
        }
      }
      return null
    }

    // components/hooks/useUsinasDataCache.ts

    if (type === 'realtime' && cache.realtime) {
    const realtimeWithTimestamp = cache.realtime
    if (realtimeWithTimestamp._timestamp && 
        Date.now() - realtimeWithTimestamp._timestamp < CACHE_DURATION.realtime) {
        console.log(`📦 Cache HIT: realtime para station ${stationId}`)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _timestamp, ...cleanRealtime } = realtimeWithTimestamp
        return cleanRealtime as T
    }
    }

    if (type === 'devices' && cache.devices) {
      console.log(`📦 Cache HIT: devices para station ${stationId}`)
      return cache.devices as T
    }

    if (type === 'solplanetInverters' && cache.solplanetInverters) {
      console.log(`📦 Cache HIT: solplanetInverters para station ${stationId}`)
      return cache.solplanetInverters as T
    }

    return null
  }, [])

  const saveToCache = useCallback((
    stationId: string,
    type: 'realtime' | 'devices' | 'history' | 'solplanetInverters',
    data: StationRealtime | DeviceSummary[] | GraphPoint[] | SolplanetInverter[],
    granularity?: Granularity,
    dateRange?: string
  ) => {
    if (!cacheRef.current[stationId]) {
      cacheRef.current[stationId] = { 
        history: {
          day: {},
          month: {},
          year: {}
        } 
      }
    }

    if (type === 'history' && granularity && dateRange) {
      if (!cacheRef.current[stationId].history[granularity]) {
        cacheRef.current[stationId].history[granularity] = {}
      }
      cacheRef.current[stationId].history[granularity]![dateRange] = {
        data: data as GraphPoint[],
        timestamp: Date.now(),
        dateRange
      }
    } else if (type === 'realtime') {
      cacheRef.current[stationId].realtime = {
        ...(data as StationRealtime),
        _timestamp: Date.now()
      }
    } else if (type === 'devices') {
      cacheRef.current[stationId].devices = data as DeviceSummary[]
    } else if (type === 'solplanetInverters') {
      cacheRef.current[stationId].solplanetInverters = data as SolplanetInverter[]
    }
  }, [])

  const clearCache = useCallback((stationId?: string) => {
    if (stationId) {
      delete cacheRef.current[stationId]
    } else {
      cacheRef.current = {}
    }
  }, [])

  return {
    cacheRef,
    getFromCache,
    saveToCache,
    clearCache
  }
}