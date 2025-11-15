import { useCallback, useEffect, useState } from 'react';
import {
    ActivityBreakdown,
    calculatePercentageChange,
    calculateSummaryStats,
    getActivityBreakdown,
    getTimeSeriesData,
    SummaryStats,
    TimeSeriesData
} from '../utils/dataAnalysis';

type PeriodType = 'daily' | 'weekly' | 'monthly';

interface UseSummaryDataReturn {
    // Current period data
    stats: SummaryStats | null;
    timeSeriesData: TimeSeriesData[];
    activityBreakdown: ActivityBreakdown | null;

    // Loading states
    loading: boolean;
    error: string | null;

    // Actions
    refreshData: () => Promise<void>;
    setPeriod: (period: PeriodType) => void;

    // Current period
    currentPeriod: PeriodType;
}

/**
 * Custom hook for managing summary data and calculations
 */
export function useSummaryData(initialPeriod: PeriodType = 'weekly'): UseSummaryDataReturn {
    const [stats, setStats] = useState<SummaryStats | null>(null);
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
    const [activityBreakdown, setActivityBreakdown] = useState<ActivityBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPeriod, setCurrentPeriod] = useState<PeriodType>(initialPeriod);

    /**
     * Load all summary data for the current period
     */
    const loadSummaryData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel for better performance
            const [statsData, timeData, breakdownData] = await Promise.all([
                calculateSummaryStats(currentPeriod),
                getTimeSeriesData(currentPeriod, currentPeriod === 'daily' ? 7 : currentPeriod === 'weekly' ? 8 : 12), // Show 7 days, 8 weeks, 12 months
                getActivityBreakdown()
            ]);

            setStats(statsData);
            setTimeSeriesData(timeData);
            setActivityBreakdown(breakdownData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load summary data';
            setError(errorMessage);
            console.error('Error loading summary data:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPeriod]);

    /**
     * Refresh data (reload current period data)
     */
    const refreshData = useCallback(async () => {
        await loadSummaryData();
    }, [loadSummaryData]);

    /**
     * Change period and reload data
     */
    const setPeriod = useCallback((period: PeriodType) => {
        setCurrentPeriod(period);
    }, []);

    // Load data when component mounts or period changes
    useEffect(() => {
        loadSummaryData();
    }, [loadSummaryData]);

    return {
        stats,
        timeSeriesData,
        activityBreakdown,
        loading,
        error,
        refreshData,
        setPeriod,
        currentPeriod
    };
}

/**
 * Hook for calculating percentage changes
 */
export function usePercentageChange(
    currentValue: number,
    period: PeriodType,
    type: 'tasks' | 'events' | 'habits' | 'productivity' = 'tasks'
) {
    const [percentageChange, setPercentageChange] = useState(0);
    const [changeLoading, setChangeLoading] = useState(true);

    useEffect(() => {
        const calculateChange = async () => {
            try {
                setChangeLoading(true);
                const change = await calculatePercentageChange(currentValue, period, type);
                setPercentageChange(change);
            } catch (error) {
                console.error('Error calculating percentage change:', error);
                setPercentageChange(0);
            } finally {
                setChangeLoading(false);
            }
        };

        calculateChange();
    }, [currentValue, period, type]);

    return {
        percentageChange,
        isPositive: percentageChange >= 0,
        isLoading: changeLoading
    };
}

export type { PeriodType };

