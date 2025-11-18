// Performance utilities and monitoring tools
import React from 'react';

export interface PerformanceMetrics {
    componentRenderTime: number;
    databaseQueryTime: number;
    memoryUsage: number;
    timestamp: number;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

// Performance monitoring class
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetrics[] = [];
    private cache = new Map<string, CacheEntry<any>>();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    // Measure component render time
    measureComponentRender(componentName: string, fn: () => void): void {
        const start = performance.now();
        fn();
        const end = performance.now();

        this.recordMetric('componentRenderTime', end - start);

        if (__DEV__) {
            console.log(`🕒 ${componentName} render time: ${(end - start).toFixed(2)}ms`);
        }
    }

    // Measure database query performance
    measureDatabaseQuery(queryName: string, fn: () => any): any {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        this.recordMetric('databaseQueryTime', end - start);

        if (__DEV__) {
            console.log(`🗄️ ${queryName} query time: ${(end - start).toFixed(2)}ms`);
        }

        return result;
    }

    // Record performance metrics
    private recordMetric(type: keyof PerformanceMetrics, value: number): void {
        const metric: PerformanceMetrics = {
            componentRenderTime: 0,
            databaseQueryTime: 0,
            memoryUsage: 0,
            timestamp: Date.now(),
            [type]: value
        };

        this.metrics.push(metric);

        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
            this.metrics.shift();
        }
    }

    // Get performance summary
    getPerformanceSummary(): Partial<PerformanceMetrics> {
        const recent = this.metrics.slice(-10);

        return {
            componentRenderTime: recent.reduce((sum, m) => sum + m.componentRenderTime, 0) / recent.length,
            databaseQueryTime: recent.reduce((sum, m) => sum + m.databaseQueryTime, 0) / recent.length,
            memoryUsage: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length
        };
    }

    // Clear metrics
    clearMetrics(): void {
        this.metrics = [];
    }

    // Memory-efficient caching
    setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    getCache<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    // Memory usage monitoring
    getMemoryUsage(): number {
        if ('memory' in performance) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
    }

    // Performance alerts
    checkPerformanceThresholds(): void {
        const summary = this.getPerformanceSummary();

        if (summary.componentRenderTime && summary.componentRenderTime > 16) {
            console.warn('⚠️ Component render time is above 16ms threshold');
        }

        if (summary.databaseQueryTime && summary.databaseQueryTime > 100) {
            console.warn('⚠️ Database query time is above 100ms threshold');
        }
    }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Lazy loading utilities
export const lazyLoad = <T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
    return React.lazy(importFunc);
};

// Memoization utilities
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();

    return ((...args: any[]) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Component performance wrapper
export const withPerformanceTracking = <P extends object>(
    Component: React.ComponentType<P>,
    componentName: string
): React.FC<P> => {
    const WrappedComponent: React.FC<P> = (props) => {
        performanceMonitor.measureComponentRender(componentName, () => {
            // Component render logic is handled by the wrapper
        });

        return React.createElement(Component, props);
    };

    WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
    return WrappedComponent;
};

// Batch update utility
export const batchUpdates = (updates: (() => void)[]): void => {
    React.startTransition(() => {
        updates.forEach(update => update());
    });
};

// Virtual scrolling utilities for large lists
export interface VirtualScrollConfig {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}

export const getVisibleItems = <T>(
    items: T[],
    scrollTop: number,
    config: VirtualScrollConfig
): { startIndex: number; endIndex: number; visibleItems: T[] } => {
    const { itemHeight, containerHeight, overscan = 5 } = config;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);

    return { startIndex, endIndex, visibleItems };
};

// Memory leak detection
export const detectMemoryLeaks = () => {
    if (__DEV__) {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Warning: Can\'t perform a React state update on an unmounted component')) {
                console.warn('🧹 Memory leak detected: State update on unmounted component');
            }
            originalConsoleError(...args);
        };
    }
};

// Performance budget monitoring
export const checkPerformanceBudget = () => {
    const summary = performanceMonitor.getPerformanceSummary();
    const budgets = {
        componentRenderTime: 16, // 60fps budget
        databaseQueryTime: 100,
    };

    Object.entries(budgets).forEach(([metric, budget]) => {
        const value = summary[metric as keyof typeof summary];
        if (value && value > budget) {
            console.warn(`⚠️ Performance budget exceeded: ${metric} is ${value.toFixed(2)}ms, budget is ${budget}ms`);
        }
    });
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
    React.useEffect(() => {
        performanceMonitor.checkPerformanceThresholds();
        checkPerformanceBudget();
    }, []);

    return {
        measureRender: (name: string, fn: () => void) =>
            performanceMonitor.measureComponentRender(name, fn),
        getMetrics: () => performanceMonitor.getPerformanceSummary(),
        clearMetrics: () => performanceMonitor.clearMetrics(),
    };
};

// Cleanup utility
export const cleanup = () => {
    performanceMonitor.clearMetrics();
    performanceMonitor.clearCache();

    if (global.gc && typeof global.gc === 'function') {
        global.gc();
    }
};
