import React, { useState, useMemo, useCallback } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCake } from '../../contexts/CakeContext';
import { Cake, CakeSearchFilters } from '../../types/cake.types';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { MemoizedCakeCard } from './CakeCard';

interface CakeCollectionViewProps {
    title?: string;
    showFilters?: boolean;
    onCakePress?: (cake: Cake) => void;
}

const CakeCollectionView: React.FC<CakeCollectionViewProps> = ({
    title = "Cake Collection",
    showFilters = true,
    onCakePress
}) => {
    const { getCakes, availableCategories, availableFlavors, availableDifficulties } = useCake();
    const [activeFilters, setActiveFilters] = useState<CakeSearchFilters>({});
    const [selectedTab, setSelectedTab] = useState<'all' | 'favorites' | 'unlocked' | 'locked'>('all');

    // Memoize the filtering logic to prevent expensive recalculations
    const filteredCakes = useMemo(() => {
        let filters: CakeSearchFilters = { ...activeFilters };

        // Apply tab-specific filters
        switch (selectedTab) {
            case 'favorites':
                filters.isFavorite = true;
                break;
            case 'unlocked':
                filters.isUnlocked = true;
                break;
            case 'locked':
                filters.isUnlocked = false;
                break;
            default:
                // 'all' tab - no additional filters
                break;
        }

        return getCakes(filters);
    }, [getCakes, activeFilters, selectedTab]);

    const handleFilterChange = (key: keyof CakeSearchFilters, value: any) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setActiveFilters({});
        setSelectedTab('all');
    };

    const renderFilterTab = (tab: string, label: string) => (
        <TouchableOpacity
            key={tab}
            style={[
                styles.filterTab,
                selectedTab === tab && styles.filterTabActive
            ]}
            onPress={() => setSelectedTab(tab as any)}
        >
            <Text style={[
                styles.filterTabText,
                selectedTab === tab && styles.filterTabTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderFilterDropdown = (
        label: string,
        value: string | undefined,
        options: { id: string, name: string }[],
        onChange: (value: string) => void
    ) => (
        <View style={styles.filterDropdown}>
            <Text style={styles.filterLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                    <TouchableOpacity
                        style={[
                            styles.filterOption,
                            !value && styles.filterOptionActive
                        ]}
                        onPress={() => onChange('')}
                    >
                        <Text style={[
                            styles.filterOptionText,
                            !value && styles.filterOptionTextActive
                        ]}>All</Text>
                    </TouchableOpacity>
                    {options.map(option => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.filterOption,
                                value === option.id && styles.filterOptionActive
                            ]}
                            onPress={() => onChange(option.id)}
                        >
                            <Text style={[
                                styles.filterOptionText,
                                value === option.id && styles.filterOptionTextActive
                            ]}>
                                {option.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderCake = useCallback(({ item }: { item: Cake }) => (
        <MemoizedCakeCard
            cake={item}
            onPress={onCakePress}
            showActions={true}
        />
    ), [onCakePress]);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                <ThemedText style={styles.count}>
                    {filteredCakes.length} cake{filteredCakes.length !== 1 ? 's' : ''}
                </ThemedText>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterTabs}
                contentContainerStyle={styles.filterTabsContent}
            >
                {renderFilterTab('all', 'All Cakes')}
                {renderFilterTab('favorites', 'Favorites')}
                {renderFilterTab('unlocked', 'Unlocked')}
                {renderFilterTab('locked', 'Locked')}
            </ScrollView>

            {/* Advanced Filters */}
            {showFilters && (
                <View style={styles.advancedFilters}>
                    {renderFilterDropdown(
                        'Category',
                        activeFilters.category,
                        availableCategories,
                        (value) => handleFilterChange('category', value || undefined)
                    )}

                    {renderFilterDropdown(
                        'Flavor',
                        activeFilters.flavor,
                        availableFlavors,
                        (value) => handleFilterChange('flavor', value || undefined)
                    )}

                    {renderFilterDropdown(
                        'Difficulty',
                        activeFilters.difficulty,
                        availableDifficulties,
                        (value) => handleFilterChange('difficulty', value || undefined)
                    )}

                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Cakes List */}
            <FlatList
                data={filteredCakes}
                renderItem={renderCake}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cakesList}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🎂</Text>
                        <ThemedText style={styles.emptyTitle}>No cakes found</ThemedText>
                        <ThemedText style={styles.emptyMessage}>
                            Try adjusting your filters or search criteria
                        </ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    count: {
        fontSize: 14,
        opacity: 0.6,
    },
    filterTabs: {
        marginBottom: 8,
    },
    filterTabsContent: {
        paddingHorizontal: 16,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    filterTabActive: {
        backgroundColor: '#007AFF',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: 'white',
    },
    advancedFilters: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    filterDropdown: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#666',
    },
    filterOptions: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    filterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    filterOptionActive: {
        backgroundColor: '#007AFF',
    },
    filterOptionText: {
        fontSize: 12,
        color: '#666',
    },
    filterOptionTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    clearButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        marginTop: 8,
    },
    clearButtonText: {
        fontSize: 12,
        color: '#FF3B30',
        fontWeight: '600',
    },
    cakesList: {
        paddingHorizontal: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default CakeCollectionView;