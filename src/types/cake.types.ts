// Cake system type definitions

export interface Cake {
    id: string;
    name: string;
    description: string;
    flavor: CakeFlavor;
    category: CakeCategory;
    difficulty: CakeDifficulty;
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    servings: number;
    imageUrl?: string;
    ingredients: CakeIngredient[];
    instructions: string[];
    nutritionalInfo?: NutritionalInfo;
    rating: number; // 1-5 stars
    reviewCount: number;
    isFavorite: boolean;
    isUnlocked: boolean;
    unlockCondition?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CakeIngredient {
    id: string;
    name: string;
    amount: number;
    unit: string;
    isOptional: boolean;
    category: IngredientCategory;
}

export interface NutritionalInfo {
    calories: number;
    protein: number; // grams
    carbohydrates: number; // grams
    fat: number; // grams
    fiber: number; // grams
    sugar: number; // grams
    sodium: number; // mg
}

export interface CakeCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

export interface CakeDifficulty {
    id: string;
    name: string;
    level: 1 | 2 | 3 | 4 | 5;
    description: string;
    color: string;
}

export interface IngredientCategory {
    id: string;
    name: string;
    color: string;
}

export interface CakeCollection {
    userId: string;
    unlockedCakes: string[]; // cake IDs
    favoriteCakes: string[]; // cake IDs
    recentCakes: string[]; // cake IDs (most recent first)
    bakingStats: BakingStats;
    achievements: Achievement[];
    totalBaked: number;
    currentStreak: number;
    longestStreak: number;
    lastBakedDate?: Date;
}

export interface BakingStats {
    totalBaked: number;
    favoriteFlavor: CakeFlavor['id'];
    mostBakedCategory: CakeCategory['id'];
    averageRating: number;
    totalTimeSpent: number; // in minutes
    completionRate: number; // percentage
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    condition: AchievementCondition;
    progress: number;
    maxProgress: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
    reward?: AchievementReward;
}

export interface AchievementCondition {
    type: 'cakes_baked' | 'streak_days' | 'rating_achieved' | 'category_mastered';
    target: number;
    category?: CakeCategory['id'];
    flavor?: CakeFlavor['id'];
}

export interface AchievementReward {
    type: 'unlock_cake' | 'special_title' | 'extra_features';
    value: string;
}

export interface CakeFlavor {
    id: string;
    name: string;
    color: string;
    emoji: string;
    description: string;
}

export interface CakeSearchFilters {
    category?: CakeCategory['id'];
    flavor?: CakeFlavor['id'];
    difficulty?: CakeDifficulty['id'];
    prepTime?: {
        min: number;
        max: number;
    };
    rating?: number;
    tags?: string[];
    isFavorite?: boolean;
    isUnlocked?: boolean;
}

export interface CakeContextValue {
    cakes: Cake[];
    collection: CakeCollection;
    availableCategories: CakeCategory[];
    availableFlavors: CakeFlavor[];
    availableDifficulties: CakeDifficulty[];
    loading: boolean;
    error: string | null;

    // Actions
    getCakes: (filters?: CakeSearchFilters) => Cake[];
    getCakeById: (id: string) => Cake | null;
    unlockCake: (cakeId: string) => Promise<void>;
    addToFavorites: (cakeId: string) => Promise<void>;
    removeFromFavorites: (cakeId: string) => Promise<void>;
    markAsBaked: (cakeId: string) => Promise<void>;
    searchCakes: (query: string) => Cake[];
    refreshCakes: () => Promise<void>;

    // Achievement methods
    checkAchievements: () => Promise<void>;
    getAchievements: () => Achievement[];
    getUnlockedAchievements: () => Achievement[];
}

export interface CakeDatabaseOperations {
    getAllCakes: () => Promise<Cake[]>;
    getCakeById: (id: string) => Promise<Cake | null>;
    getAvailableCategories: () => Promise<CakeCategory[]>;
    getAvailableFlavors: () => Promise<CakeFlavor[]>;
    getAvailableDifficulties: () => Promise<CakeDifficulty[]>;
    getUserCollection: (userId: string) => Promise<CakeCollection | null>;
    updateUserCollection: (userId: string, collection: Partial<CakeCollection>) => Promise<void>;
    searchCakes: (query: string, filters?: CakeSearchFilters) => Promise<Cake[]>;
    getCakesByCategory: (categoryId: string) => Promise<Cake[]>;
    getCakesByFlavor: (flavorId: string) => Promise<Cake[]>;
}
