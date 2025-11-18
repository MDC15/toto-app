import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCake } from '../../contexts/CakeContext';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface CakeWidgetProps {
    onPress?: () => void;
}

const CakeWidget: React.FC<CakeWidgetProps> = ({ onPress }) => {
    const { collection, getCakes } = useCake();

    // Memoize expensive calculations
    const recentCakes = useMemo(() => getCakes().slice(0, 3), [getCakes]);
    const unlockedCount = collection?.unlockedCakes.length || 0;
    const totalBaked = collection?.totalBaked || 0;
    const currentStreak = collection?.currentStreak || 0;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <ThemedView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.cakeEmoji}>🎂</Text>
                        <ThemedText style={styles.title}>Cake Collection</ThemedText>
                    </View>
                    <ThemedText style={styles.count}>
                        {unlockedCount} unlocked
                    </ThemedText>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>🍰</Text>
                        <ThemedText style={styles.statValue}>{totalBaked}</ThemedText>
                        <ThemedText style={styles.statLabel}>Baked</ThemedText>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <ThemedText style={styles.statValue}>{currentStreak}</ThemedText>
                        <ThemedText style={styles.statLabel}>Streak</ThemedText>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>⭐</Text>
                        <ThemedText style={styles.statValue}>
                            {collection?.bakingStats.averageRating.toFixed(1) || '0.0'}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Rating</ThemedText>
                    </View>
                </View>

                {/* Recent Cakes Preview */}
                {recentCakes.length > 0 && (
                    <View style={styles.recentSection}>
                        <ThemedText style={styles.recentTitle}>Recent Cakes</ThemedText>
                        <View style={styles.cakesPreview}>
                            {recentCakes.map((cake, index) => (
                                <View key={cake.id} style={styles.cakePreview}>
                                    <View style={[styles.cakeIcon, { backgroundColor: cake.flavor.color }]}>
                                        <Text style={styles.cakeIconEmoji}>{cake.flavor.emoji}</Text>
                                    </View>
                                    <ThemedText style={styles.cakePreviewName} numberOfLines={1}>
                                        {cake.name}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Call to Action */}
                <View style={styles.cta}>
                    <Text style={styles.ctaIcon}>➕</Text>
                    <ThemedText style={styles.ctaText}>Explore Cake Collection</ThemedText>
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
};

// Export memoized component to prevent unnecessary re-renders
export const MemoizedCakeWidget = memo(CakeWidget);

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cakeEmoji: {
        fontSize: 24,
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    count: {
        fontSize: 12,
        opacity: 0.6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        opacity: 0.6,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(0, 122, 255, 0.2)',
        marginHorizontal: 8,
    },
    recentSection: {
        marginBottom: 16,
    },
    recentTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    cakesPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cakePreview: {
        flex: 1,
        alignItems: 'center',
    },
    cakeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    cakeIconEmoji: {
        fontSize: 16,
    },
    cakePreviewName: {
        fontSize: 10,
        textAlign: 'center',
        opacity: 0.7,
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    ctaIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    ctaText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
});
