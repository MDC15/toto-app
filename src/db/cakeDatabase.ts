import {
    Achievement,
    Cake,
    CakeCategory,
    CakeCollection,
    CakeDatabaseOperations,
    CakeDifficulty,
    CakeFlavor,
    CakeSearchFilters,
    IngredientCategory
} from '../types/cake.types';

// Sample data for cake system
const sampleCategories: CakeCategory[] = [
    {
        id: 'classic',
        name: 'Classic Cakes',
        description: 'Traditional and beloved cake recipes',
        icon: '🎂',
        color: '#FF6B6B'
    },
    {
        id: 'chocolate',
        name: 'Chocolate Cakes',
        description: 'Rich and decadent chocolate treats',
        icon: '🍫',
        color: '#8B4513'
    },
    {
        id: 'fruit',
        name: 'Fruit Cakes',
        description: 'Fresh and fruity cake varieties',
        icon: '🍓',
        color: '#FF69B4'
    },
    {
        id: 'cheesecake',
        name: 'Cheesecakes',
        description: 'Creamy and smooth cheesecake varieties',
        icon: '🍰',
        color: '#FFD700'
    },
    {
        id: 'seasonal',
        name: 'Seasonal Specials',
        description: 'Limited-time seasonal cake creations',
        icon: '🌟',
        color: '#9370DB'
    }
];

const sampleFlavors: CakeFlavor[] = [
    {
        id: 'vanilla',
        name: 'Vanilla',
        color: '#F3E5AB',
        emoji: '🌼',
        description: 'Classic and timeless vanilla flavor'
    },
    {
        id: 'chocolate',
        name: 'Chocolate',
        color: '#8B4513',
        emoji: '🍫',
        description: 'Rich and indulgent chocolate taste'
    },
    {
        id: 'strawberry',
        name: 'Strawberry',
        color: '#FF69B4',
        emoji: '🍓',
        description: 'Sweet and fruity strawberry goodness'
    },
    {
        id: 'lemon',
        name: 'Lemon',
        color: '#FFFACD',
        emoji: '🍋',
        description: 'Zesty and refreshing lemon flavor'
    },
    {
        id: 'red-velvet',
        name: 'Red Velvet',
        color: '#DC143C',
        emoji: '❤️',
        description: 'Luxurious red velvet with cream cheese'
    },
    {
        id: 'carrot',
        name: 'Carrot',
        color: '#FF8C00',
        emoji: '🥕',
        description: 'Spiced carrot cake with cream cheese frosting'
    }
];

const sampleDifficulties: CakeDifficulty[] = [
    {
        id: 'beginner',
        name: 'Beginner',
        level: 1,
        description: 'Perfect for beginners, simple steps',
        color: '#90EE90'
    },
    {
        id: 'easy',
        name: 'Easy',
        level: 2,
        description: 'Straightforward recipes with basic techniques',
        color: '#87CEEB'
    },
    {
        id: 'medium',
        name: 'Medium',
        level: 3,
        description: 'Moderate challenge, some skill required',
        color: '#FFD700'
    },
    {
        id: 'hard',
        name: 'Hard',
        level: 4,
        description: 'Advanced techniques and timing required',
        color: '#FF6347'
    },
    {
        id: 'expert',
        name: 'Expert',
        level: 5,
        description: 'Master-level baking for experienced bakers',
        color: '#9932CC'
    }
];

const sampleIngredientCategories: IngredientCategory[] = [
    {
        id: 'flour',
        name: 'Flour',
        color: '#F5F5DC'
    },
    {
        id: 'sugar',
        name: 'Sugar',
        color: '#FFF'
    },
    {
        id: 'eggs',
        name: 'Eggs',
        color: '#FFE4B5'
    },
    {
        id: 'butter',
        name: 'Butter',
        color: '#FFFF00'
    },
    {
        id: 'dairy',
        name: 'Dairy',
        color: '#F0F8FF'
    },
    {
        id: 'flavoring',
        name: 'Flavoring',
        color: '#FFE4E1'
    }
];

const sampleCakes: Cake[] = [
    {
        id: 'chocolate-fudge-cake',
        name: 'Chocolate Fudge Cake',
        description: 'A rich, moist chocolate cake with smooth chocolate ganache frosting. Perfect for chocolate lovers!',
        flavor: sampleFlavors[1], // chocolate
        category: sampleCategories[1], // chocolate
        difficulty: sampleDifficulties[2], // medium
        prepTime: 30,
        cookTime: 35,
        servings: 12,
        imageUrl: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Chocolate+Cake',
        ingredients: [
            {
                id: 'ingredients-1',
                name: 'All-purpose flour',
                amount: 2,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[0] // flour
            },
            {
                id: 'ingredients-2',
                name: 'Granulated sugar',
                amount: 2,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[1] // sugar
            },
            {
                id: 'ingredients-3',
                name: 'Unsweetened cocoa powder',
                amount: 0.75,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[1] // sugar
            },
            {
                id: 'ingredients-4',
                name: 'Large eggs',
                amount: 3,
                unit: 'eggs',
                isOptional: false,
                category: sampleIngredientCategories[2] // eggs
            },
            {
                id: 'ingredients-5',
                name: 'Unsalted butter, melted',
                amount: 0.75,
                unit: 'cup',
                isOptional: false,
                category: sampleIngredientCategories[3] // butter
            },
            {
                id: 'ingredients-6',
                name: 'Vanilla extract',
                amount: 2,
                unit: 'teaspoons',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-7',
                name: 'Baking powder',
                amount: 2,
                unit: 'teaspoons',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-8',
                name: 'Salt',
                amount: 0.5,
                unit: 'teaspoon',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-9',
                name: 'Buttermilk',
                amount: 1,
                unit: 'cup',
                isOptional: false,
                category: sampleIngredientCategories[4] // dairy
            }
        ],
        instructions: [
            'Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.',
            'In a large bowl, whisk together flour, sugar, cocoa powder, baking powder, and salt.',
            'In another bowl, whisk together melted butter, eggs, vanilla extract, and buttermilk.',
            'Gradually add wet ingredients to dry ingredients, stirring until just combined.',
            'Divide batter evenly between prepared pans.',
            'Bake for 30-35 minutes, or until a toothpick inserted in the center comes out clean.',
            'Cool in pans for 10 minutes, then turn out onto wire racks to cool completely.',
            'Prepare chocolate ganache frosting while cakes cool.',
            'Level cake tops if necessary, then frost layers with ganache.',
            'Chill cake for 30 minutes before serving for best results.'
        ],
        nutritionalInfo: {
            calories: 420,
            protein: 6,
            carbohydrates: 58,
            fat: 19,
            fiber: 3,
            sugar: 38,
            sodium: 285
        },
        rating: 4.8,
        reviewCount: 1247,
        isFavorite: false,
        isUnlocked: true,
        tags: ['chocolate', 'rich', 'ganache', 'celebration'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
    },
    {
        id: 'vanilla-cupcakes',
        name: 'Classic Vanilla Cupcakes',
        description: 'Light, fluffy vanilla cupcakes with smooth buttercream frosting. Perfect for any occasion!',
        flavor: sampleFlavors[0], // vanilla
        category: sampleCategories[0], // classic
        difficulty: sampleDifficulties[0], // beginner
        prepTime: 20,
        cookTime: 18,
        servings: 24,
        imageUrl: 'https://via.placeholder.com/300x200/F3E5AB/000000?text=Vanilla+Cupcakes',
        ingredients: [
            {
                id: 'ingredients-10',
                name: 'All-purpose flour',
                amount: 2,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[0] // flour
            },
            {
                id: 'ingredients-11',
                name: 'Granulated sugar',
                amount: 1.5,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[1] // sugar
            },
            {
                id: 'ingredients-12',
                name: 'Large eggs',
                amount: 2,
                unit: 'eggs',
                isOptional: false,
                category: sampleIngredientCategories[2] // eggs
            },
            {
                id: 'ingredients-13',
                name: 'Unsalted butter, softened',
                amount: 0.5,
                unit: 'cup',
                isOptional: false,
                category: sampleIngredientCategories[3] // butter
            },
            {
                id: 'ingredients-14',
                name: 'Vanilla extract',
                amount: 2,
                unit: 'teaspoons',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-15',
                name: 'Baking powder',
                amount: 2,
                unit: 'teaspoons',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-16',
                name: 'Milk',
                amount: 1,
                unit: 'cup',
                isOptional: false,
                category: sampleIngredientCategories[4] // dairy
            }
        ],
        instructions: [
            'Preheat oven to 375°F (190°C) and line cupcake pans with liners.',
            'In a large bowl, cream butter and sugar until light and fluffy.',
            'Beat in eggs one at a time, then add vanilla extract.',
            'In another bowl, whisk together flour and baking powder.',
            'Alternately add dry ingredients and milk to the butter mixture, beginning and ending with flour.',
            'Fill cupcake liners 2/3 full with batter.',
            'Bake for 16-18 minutes, or until a toothpick inserted in the center comes out clean.',
            'Cool in pans for 5 minutes, then transfer to wire racks to cool completely.',
            'Frost with buttercream frosting once completely cool.'
        ],
        nutritionalInfo: {
            calories: 185,
            protein: 3,
            carbohydrates: 28,
            fat: 6,
            fiber: 0,
            sugar: 18,
            sodium: 145
        },
        rating: 4.6,
        reviewCount: 892,
        isFavorite: false,
        isUnlocked: true,
        tags: ['vanilla', 'cupcakes', 'buttercream', 'beginner'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
    },
    {
        id: 'red-velvet-cake',
        name: 'Red Velvet Cake',
        description: 'Luxurious red velvet cake with cream cheese frosting. A classic southern dessert!',
        flavor: sampleFlavors[4], // red velvet
        category: sampleCategories[0], // classic
        difficulty: sampleDifficulties[3], // hard
        prepTime: 45,
        cookTime: 30,
        servings: 16,
        imageUrl: 'https://via.placeholder.com/300x200/DC143C/FFFFFF?text=Red+Velvet+Cake',
        ingredients: [
            {
                id: 'ingredients-17',
                name: 'All-purpose flour',
                amount: 2.5,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[0] // flour
            },
            {
                id: 'ingredients-18',
                name: 'Granulated sugar',
                amount: 2,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[1] // sugar
            },
            {
                id: 'ingredients-19',
                name: 'Unsweetened cocoa powder',
                amount: 2,
                unit: 'tablespoons',
                isOptional: false,
                category: sampleIngredientCategories[1] // sugar
            },
            {
                id: 'ingredients-20',
                name: 'Baking soda',
                amount: 1,
                unit: 'teaspoon',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-21',
                name: 'Salt',
                amount: 1,
                unit: 'teaspoon',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-22',
                name: 'Large eggs',
                amount: 2,
                unit: 'eggs',
                isOptional: false,
                category: sampleIngredientCategories[2] // eggs
            },
            {
                id: 'ingredients-23',
                name: 'Vegetable oil',
                amount: 1.5,
                unit: 'cups',
                isOptional: false,
                category: sampleIngredientCategories[3] // butter
            },
            {
                id: 'ingredients-24',
                name: 'Buttermilk',
                amount: 1,
                unit: 'cup',
                isOptional: false,
                category: sampleIngredientCategories[4] // dairy
            },
            {
                id: 'ingredients-25',
                name: 'Vanilla extract',
                amount: 1,
                unit: 'teaspoon',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            },
            {
                id: 'ingredients-26',
                name: 'Red food coloring',
                amount: 2,
                unit: 'tablespoons',
                isOptional: false,
                category: sampleIngredientCategories[5] // flavoring
            }
        ],
        instructions: [
            'Preheat oven to 350°F (175°C). Grease and flour three 9-inch round cake pans.',
            'In a large bowl, sift together flour, sugar, cocoa powder, baking soda, and salt.',
            'In another bowl, whisk together eggs, vegetable oil, buttermilk, vanilla extract, and red food coloring.',
            'Gradually add wet ingredients to dry ingredients, stirring until just combined.',
            'Divide batter evenly between prepared pans.',
            'Bake for 25-30 minutes, or until a toothpick inserted in the center comes out clean.',
            'Cool in pans for 10 minutes, then turn out onto wire racks to cool completely.',
            'Prepare cream cheese frosting while cakes cool.',
            'Level cake tops if necessary, then frost layers with cream cheese frosting.',
            'Chill cake for at least 1 hour before serving.'
        ],
        nutritionalInfo: {
            calories: 465,
            protein: 5,
            carbohydrates: 58,
            fat: 24,
            fiber: 1,
            sugar: 42,
            sodium: 385
        },
        rating: 4.9,
        reviewCount: 2156,
        isFavorite: false,
        isUnlocked: false,
        unlockCondition: 'Bake 3 different cake types',
        tags: ['red-velvet', 'cream-cheese', 'southern', 'luxury'],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
    }
];

const sampleAchievements: Achievement[] = [
    {
        id: 'first-cake',
        name: 'First Cake',
        description: 'Bake your very first cake!',
        icon: '🎂',
        color: '#FFD700',
        condition: {
            type: 'cakes_baked',
            target: 1
        },
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
        reward: {
            type: 'special_title',
            value: 'Novice Baker'
        }
    },
    {
        id: 'chocolate-lover',
        name: 'Chocolate Lover',
        description: 'Bake 5 different chocolate cakes',
        icon: '🍫',
        color: '#8B4513',
        condition: {
            type: 'category_mastered',
            target: 5,
            category: 'chocolate'
        },
        progress: 0,
        maxProgress: 5,
        isUnlocked: false,
        reward: {
            type: 'unlock_cake',
            value: 'chocolate-truffle-cake'
        }
    },
    {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Bake for 7 days in a row',
        icon: '🔥',
        color: '#FF6347',
        condition: {
            type: 'streak_days',
            target: 7
        },
        progress: 0,
        maxProgress: 7,
        isUnlocked: false,
        reward: {
            type: 'extra_features',
            value: 'Advanced_frosting_tips'
        }
    },
    {
        id: 'perfect-rating',
        name: 'Perfect Rating',
        description: 'Achieve a 5-star rating on a cake',
        icon: '⭐',
        color: '#FFD700',
        condition: {
            type: 'rating_achieved',
            target: 5
        },
        progress: 0,
        maxProgress: 5,
        isUnlocked: false,
        reward: {
            type: 'special_title',
            value: 'Master Baker'
        }
    }
];

// Initialize sample user collection
const createSampleCollection = (userId: string): CakeCollection => ({
    userId,
    unlockedCakes: ['chocolate-fudge-cake', 'vanilla-cupcakes'],
    favoriteCakes: [],
    recentCakes: ['vanilla-cupcakes'],
    bakingStats: {
        totalBaked: 3,
        favoriteFlavor: 'vanilla',
        mostBakedCategory: 'classic',
        averageRating: 4.2,
        totalTimeSpent: 120,
        completionRate: 85
    },
    achievements: sampleAchievements.map(achievement => ({
        ...achievement,
        progress: 0
    })),
    totalBaked: 3,
    currentStreak: 2,
    longestStreak: 5,
    lastBakedDate: new Date()
});

// In-memory storage simulation
let userCollections = new Map<string, CakeCollection>();

// In-memory cache for better performance
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache configuration
const CACHE_TTL = {
    CAKES: 5 * 60 * 1000, // 5 minutes
    COLLECTION: 1 * 60 * 1000, // 1 minute
    METADATA: 30 * 60 * 1000, // 30 minutes
};

// Helper function to get from cache or fetch fresh data
const getCachedData = async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.CAKES
): Promise<T> => {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
        return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: now, ttl });
    return data;
};

// Optimized database operations implementation
export const CakeDatabase: CakeDatabaseOperations = {
    async getAllCakes(): Promise<Cake[]> {
        return getCachedData(
            'all-cakes',
            async () => sampleCakes,
            CACHE_TTL.CAKES
        );
    },

    async getCakeById(id: string): Promise<Cake | null> {
        const cakes = await this.getAllCakes();
        return cakes.find(cake => cake.id === id) || null;
    },

    async getAvailableCategories(): Promise<CakeCategory[]> {
        return getCachedData(
            'categories',
            async () => sampleCategories,
            CACHE_TTL.METADATA
        );
    },

    async getAvailableFlavors(): Promise<CakeFlavor[]> {
        return getCachedData(
            'flavors',
            async () => sampleFlavors,
            CACHE_TTL.METADATA
        );
    },

    async getAvailableDifficulties(): Promise<CakeDifficulty[]> {
        return getCachedData(
            'difficulties',
            async () => sampleDifficulties,
            CACHE_TTL.METADATA
        );
    },

    async getUserCollection(userId: string): Promise<CakeCollection | null> {
        return getCachedData(
            `collection-${userId}`,
            async () => {
                if (!userCollections.has(userId)) {
                    userCollections.set(userId, createSampleCollection(userId));
                }
                return userCollections.get(userId) || null;
            },
            CACHE_TTL.COLLECTION
        );
    },

    async updateUserCollection(userId: string, collectionUpdate: Partial<CakeCollection>): Promise<void> {
        const existingCollection = userCollections.get(userId) || createSampleCollection(userId);
        const updatedCollection = {
            ...existingCollection,
            ...collectionUpdate,
            // Merge achievements if provided
            achievements: collectionUpdate.achievements
                ? [...existingCollection.achievements, ...collectionUpdate.achievements]
                : existingCollection.achievements
        };

        userCollections.set(userId, updatedCollection);

        // Clear related cache entries
        cache.delete(`collection-${userId}`);
    },

    async searchCakes(query: string, filters?: CakeSearchFilters): Promise<Cake[]> {
        const cakes = await this.getAllCakes();
        const searchKey = `search-${query}-${JSON.stringify(filters)}`;

        return getCachedData(
            searchKey,
            async () => {
                let filteredCakes = cakes.filter(cake => {
                    const matchesQuery = cake.name.toLowerCase().includes(query.toLowerCase()) ||
                        cake.description.toLowerCase().includes(query.toLowerCase()) ||
                        cake.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

                    if (!matchesQuery) return false;

                    if (filters?.category && cake.category.id !== filters.category) return false;
                    if (filters?.flavor && cake.flavor.id !== filters.flavor) return false;
                    if (filters?.difficulty && cake.difficulty.id !== filters.difficulty) return false;
                    if (filters?.rating && cake.rating < filters.rating) return false;
                    if (filters?.isUnlocked !== undefined && cake.isUnlocked !== filters.isUnlocked) return false;
                    if (filters?.isFavorite !== undefined && cake.isFavorite !== filters.isFavorite) return false;

                    if (filters?.prepTime) {
                        if (cake.prepTime < filters.prepTime.min || cake.prepTime > filters.prepTime.max) return false;
                    }

                    if (filters?.tags && filters.tags.length > 0) {
                        const hasMatchingTag = filters.tags.some(tag =>
                            cake.tags.some(cakeTag => cakeTag.toLowerCase().includes(tag.toLowerCase()))
                        );
                        if (!hasMatchingTag) return false;
                    }

                    return true;
                });

                return filteredCakes;
            },
            CACHE_TTL.CAKES
        );
    },

    async getCakesByCategory(categoryId: string): Promise<Cake[]> {
        const cakes = await this.getAllCakes();
        const cacheKey = `cakes-category-${categoryId}`;

        return getCachedData(
            cacheKey,
            async () => cakes.filter(cake => cake.category.id === categoryId),
            CACHE_TTL.CAKES
        );
    },

    async getCakesByFlavor(flavorId: string): Promise<Cake[]> {
        const cakes = await this.getAllCakes();
        const cacheKey = `cakes-flavor-${flavorId}`;

        return getCachedData(
            cacheKey,
            async () => cakes.filter(cake => cake.flavor.id === flavorId),
            CACHE_TTL.CAKES
        );
    }
};

// Export sample data for other modules
export {
    sampleAchievements, sampleCakes,
    sampleCategories, sampleDifficulties, sampleFlavors, sampleIngredientCategories
};
