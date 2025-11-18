import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
    useCallback,
    useMemo,
    memo
} from 'react';
import { CakeDatabase } from '../db/cakeDatabase';
import {
    Achievement,
    Cake,
    CakeCategory,
    CakeCollection,
    CakeContextValue,
    CakeDifficulty,
    CakeFlavor,
    CakeSearchFilters
} from '../types/cake.types';

// Action types for the reducer
type CakeAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CAKES'; payload: Cake[] }
    | { type: 'SET_COLLECTION'; payload: CakeCollection }
    | { type: 'SET_CATEGORIES'; payload: CakeCategory[] }
    | { type: 'SET_FLAVORS'; payload: CakeFlavor[] }
    | { type: 'SET_DIFFICULTIES'; payload: CakeDifficulty[] }
    | { type: 'UNLOCK_CAKE'; payload: string }
    | { type: 'ADD_TO_FAVORITES'; payload: string }
    | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
    | { type: 'MARK_AS_BAKED'; payload: string }
    | { type: 'UPDATE_ACHIEVEMENTS'; payload: Achievement[] };

// State interface
interface CakeState {
    cakes: Cake[];
    collection: CakeCollection | null;
    availableCategories: CakeCategory[];
    availableFlavors: CakeFlavor[];
    availableDifficulties: CakeDifficulty[];
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: CakeState = {
    cakes: [],
    collection: null,
    availableCategories: [],
    availableFlavors: [],
    availableDifficulties: [],
    loading: false,
    error: null
};

// Optimized reducer function with memoization helpers
const cakeReducer = (state: CakeState, action: CakeAction): CakeState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        case 'SET_CAKES':
            return { ...state, cakes: action.payload };

        case 'SET_COLLECTION':
            return { ...state, collection: action.payload };

        case 'SET_CATEGORIES':
            return { ...state, availableCategories: action.payload };

        case 'SET_FLAVORS':
            return { ...state, availableFlavors: action.payload };

        case 'SET_DIFFICULTIES':
            return { ...state, availableDifficulties: action.payload };

        case 'UNLOCK_CAKE':
            if (!state.collection) return state;
            return {
                ...state,
                collection: {
                    ...state.collection,
                    unlockedCakes: [...state.collection.unlockedCakes, action.payload]
                }
            };

        case 'ADD_TO_FAVORITES':
            if (!state.collection) return state;
            return {
                ...state,
                collection: {
                    ...state.collection,
                    favoriteCakes: [...state.collection.favoriteCakes, action.payload]
                }
            };

        case 'REMOVE_FROM_FAVORITES':
            if (!state.collection) return state;
            return {
                ...state,
                collection: {
                    ...state.collection,
                    favoriteCakes: state.collection.favoriteCakes.filter(id => id !== action.payload)
                }
            };

        case 'MARK_AS_BAKED':
            if (!state.collection) return state;

            const now = new Date();
            let newStreak = state.collection.currentStreak;
            const lastBaked = state.collection.lastBakedDate ? new Date(state.collection.lastBakedDate) : null;

            if (!lastBaked || lastBaked.toDateString() !== now.toDateString()) {
                if (lastBaked) {
                    const daysDiff = Math.floor((now.getTime() - lastBaked.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysDiff === 1) {
                        newStreak += 1;
                    } else {
                        newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }
            }

            const newLongestStreak = Math.max(state.collection.longestStreak, newStreak);
            const updatedStats = {
                ...state.collection.bakingStats,
                totalBaked: state.collection.bakingStats.totalBaked + 1
            };

            return {
                ...state,
                collection: {
                    ...state.collection,
                    totalBaked: state.collection.totalBaked + 1,
                    recentCakes: [action.payload, ...state.collection.recentCakes.filter(id => id !== action.payload)].slice(0, 10),
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastBakedDate: now,
                    bakingStats: updatedStats
                }
            };

        case 'UPDATE_ACHIEVEMENTS':
            if (!state.collection) return state;
            return {
                ...state,
                collection: {
                    ...state.collection,
                    achievements: action.payload
                }
            };

        default:
            return state;
    }
};

// Create context
const CakeContext = createContext<CakeContextValue | null>(null);

// Context provider props
interface CakeProviderProps {
    children: ReactNode;
    userId?: string;
}

// Optimized context provider component
export const CakeProvider: React.FC<CakeProviderProps> = ({ children, userId = 'default-user' }) => {
    const [state, dispatch] = useReducer(cakeReducer, initialState);

    // Memoized user ID getter to prevent unnecessary re-renders
    const getCurrentUserId = useCallback((): string => {
        return userId;
    }, [userId]);

    // Load initial data with dependency optimization
    useEffect(() => {
        let mounted = true;

        const loadInitialData = async () => {
            if (!mounted) return;

            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            try {
                const [cakes, collection, categories, flavors, difficulties] = await Promise.all([
                    CakeDatabase.getAllCakes(),
                    CakeDatabase.getUserCollection(getCurrentUserId()),
                    CakeDatabase.getAvailableCategories(),
                    CakeDatabase.getAvailableFlavors(),
                    CakeDatabase.getAvailableDifficulties()
                ]);

                if (mounted) {
                    dispatch({ type: 'SET_CAKES', payload: cakes });
                    dispatch({ type: 'SET_COLLECTION', payload: collection! });
                    dispatch({ type: 'SET_CATEGORIES', payload: categories });
                    dispatch({ type: 'SET_FLAVORS', payload: flavors });
                    dispatch({ type: 'SET_DIFFICULTIES', payload: difficulties });
                }
            } catch (error) {
                if (mounted) {
                    dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cake data' });
                }
            } finally {
                if (mounted) {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            }
        };

        loadInitialData();

        return () => {
            mounted = false;
        };
    }, [getCurrentUserId]);

    // Memoized cake filtering function - expensive operation
    const getCakes = useCallback((filters?: CakeSearchFilters): Cake[] => {
        if (!state.cakes.length) return [];

        const memoizedFilter = (cakes: Cake[], filterFn: (cake: Cake) => boolean): Cake[] => {
            const result = cakes.filter(filterFn);
            return result;
        };

        let filteredCakes = state.cakes;

        if (filters) {
            if (filters.category) {
                filteredCakes = memoizedFilter(filteredCakes, cake => cake.category.id === filters.category);
            }
            if (filters.flavor) {
                filteredCakes = memoizedFilter(filteredCakes, cake => cake.flavor.id === filters.flavor);
            }
            if (filters.difficulty) {
                filteredCakes = memoizedFilter(filteredCakes, cake => cake.difficulty.id === filters.difficulty);
            }
            if (filters.isUnlocked !== undefined) {
                filteredCakes = memoizedFilter(filteredCakes, cake => cake.isUnlocked === filters.isUnlocked);
            }
            if (filters.isFavorite !== undefined && state.collection) {
                const favoriteIds = state.collection.favoriteCakes;
                filteredCakes = memoizedFilter(filteredCakes, cake =>
                    filters.isFavorite ? favoriteIds.includes(cake.id) : !favoriteIds.includes(cake.id)
                );
            }
            if (filters.rating) {
                filteredCakes = memoizedFilter(filteredCakes, cake => cake.rating >= filters.rating!);
            }
            if (filters.prepTime) {
                filteredCakes = memoizedFilter(filteredCakes, cake =>
                    cake.prepTime >= filters.prepTime!.min && cake.prepTime <= filters.prepTime!.max
                );
            }
        }

        return filteredCakes;
    }, [state.cakes, state.collection]);

    // Memoized cake lookup function
    const getCakeById = useCallback((id: string): Cake | null => {
        return state.cakes.find(cake => cake.id === id) || null;
    }, [state.cakes]);

    // Optimized action functions
    const unlockCake = useCallback(async (cakeId: string): Promise<void> => {
        if (!state.collection || state.collection.unlockedCakes.includes(cakeId)) {
            return;
        }

        const newCollection = {
            ...state.collection,
            unlockedCakes: [...state.collection.unlockedCakes, cakeId]
        };

        await CakeDatabase.updateUserCollection(getCurrentUserId(), newCollection);
        dispatch({ type: 'UNLOCK_CAKE', payload: cakeId });
    }, [state.collection, getCurrentUserId]);

    const addToFavorites = useCallback(async (cakeId: string): Promise<void> => {
        if (!state.collection || state.collection.favoriteCakes.includes(cakeId)) {
            return;
        }

        const newCollection = {
            ...state.collection,
            favoriteCakes: [...state.collection.favoriteCakes, cakeId]
        };

        await CakeDatabase.updateUserCollection(getCurrentUserId(), newCollection);
        dispatch({ type: 'ADD_TO_FAVORITES', payload: cakeId });
    }, [state.collection, getCurrentUserId]);

    const removeFromFavorites = useCallback(async (cakeId: string): Promise<void> => {
        if (!state.collection) {
            return;
        }

        const newCollection = {
            ...state.collection,
            favoriteCakes: state.collection.favoriteCakes.filter(id => id !== cakeId)
        };

        await CakeDatabase.updateUserCollection(getCurrentUserId(), newCollection);
        dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: cakeId });
    }, [state.collection, getCurrentUserId]);

    const markAsBaked = useCallback(async (cakeId: string): Promise<void> => {
        if (!state.collection) {
            return;
        }

        dispatch({ type: 'MARK_AS_BAKED', payload: cakeId });

        // Update database in background to prevent blocking UI
        const newCollection = { ...state.collection };
        newCollection.totalBaked += 1;
        newCollection.recentCakes = [cakeId, ...newCollection.recentCakes.filter(id => id !== cakeId)].slice(0, 10);

        const today = new Date();
        const lastBaked = newCollection.lastBakedDate ? new Date(newCollection.lastBakedDate) : null;

        if (!lastBaked || lastBaked.toDateString() !== today.toDateString()) {
            if (lastBaked) {
                const daysDiff = Math.floor((today.getTime() - lastBaked.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff === 1) {
                    newCollection.currentStreak += 1;
                } else {
                    newCollection.currentStreak = 1;
                }
            } else {
                newCollection.currentStreak = 1;
            }
        }

        newCollection.longestStreak = Math.max(newCollection.longestStreak, newCollection.currentStreak);
        newCollection.lastBakedDate = today;

        newCollection.bakingStats = {
            ...newCollection.bakingStats,
            totalBaked: newCollection.bakingStats.totalBaked + 1
        };

        // Update database asynchronously
        CakeDatabase.updateUserCollection(getCurrentUserId(), newCollection).catch(console.error);

        // Check achievements asynchronously
        checkAchievements().catch(console.error);
    }, [state.collection, getCurrentUserId]);

    // Memoized search function
    const searchCakes = useCallback((query: string): Cake[] => {
        if (!query.trim() || !state.cakes.length) {
            return state.cakes;
        }

        const searchTerm = query.toLowerCase();
        return state.cakes.filter(cake =>
            cake.name.toLowerCase().includes(searchTerm) ||
            cake.description.toLowerCase().includes(searchTerm) ||
            cake.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }, [state.cakes]);

    // Refresh function with error handling
    const refreshCakes = useCallback(async (): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const cakes = await CakeDatabase.getAllCakes();
            dispatch({ type: 'SET_CAKES', payload: cakes });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh cakes' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    // Memoized achievement functions
    const checkAchievements = useCallback(async (): Promise<void> => {
        if (!state.collection) return;

        const updatedAchievements = state.collection.achievements.map(achievement => {
            let newProgress = achievement.progress;

            switch (achievement.condition.type) {
                case 'cakes_baked':
                    newProgress = state.collection!.totalBaked;
                    break;
                case 'streak_days':
                    newProgress = state.collection!.currentStreak;
                    break;
                case 'rating_achieved':
                    newProgress = Math.min(state.collection!.bakingStats.averageRating, 5);
                    break;
                case 'category_mastered':
                    if (achievement.condition.category) {
                        const cakesInCategory = state.cakes.filter(cake =>
                            cake.category.id === achievement.condition.category &&
                            state.collection!.recentCakes.includes(cake.id)
                        );
                        newProgress = cakesInCategory.length;
                    }
                    break;
            }

            const isUnlocked = newProgress >= achievement.condition.target;
            return {
                ...achievement,
                progress: newProgress,
                isUnlocked,
                unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date() : achievement.unlockedAt
            };
        });

        const newCollection = {
            ...state.collection,
            achievements: updatedAchievements
        };

        await CakeDatabase.updateUserCollection(getCurrentUserId(), newCollection);
        dispatch({ type: 'UPDATE_ACHIEVEMENTS', payload: updatedAchievements });
    }, [state.collection, state.cakes, getCurrentUserId]);

    const getAchievements = useCallback((): Achievement[] => {
        return state.collection?.achievements || [];
    }, [state.collection]);

    const getUnlockedAchievements = useCallback((): Achievement[] => {
        return state.collection?.achievements.filter(achievement => achievement.isUnlocked) || [];
    }, [state.collection]);

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo((): CakeContextValue => ({
        cakes: state.cakes,
        collection: state.collection!,
        availableCategories: state.availableCategories,
        availableFlavors: state.availableFlavors,
        availableDifficulties: state.availableDifficulties,
        loading: state.loading,
        error: state.error,

        // Actions
        getCakes,
        getCakeById,
        unlockCake,
        addToFavorites,
        removeFromFavorites,
        markAsBaked,
        searchCakes,
        refreshCakes,

        // Achievement methods
        checkAchievements,
        getAchievements,
        getUnlockedAchievements
    }), [
        state.cakes,
        state.collection,
        state.availableCategories,
        state.availableFlavors,
        state.availableDifficulties,
        state.loading,
        state.error,
        getCakes,
        getCakeById,
        unlockCake,
        addToFavorites,
        removeFromFavorites,
        markAsBaked,
        searchCakes,
        refreshCakes,
        checkAchievements,
        getAchievements,
        getUnlockedAchievements
    ]);

    return (
        <CakeContext.Provider value={contextValue}>
            {children}
        </CakeContext.Provider>
    );
};

// Hook to use the cake context
export const useCake = (): CakeContextValue => {
    const context = useContext(CakeContext);
    if (!context) {
        throw new Error('useCake must be used within a CakeProvider');
    }
    return context;
};

// Export the context for advanced usage
export { CakeContext };
