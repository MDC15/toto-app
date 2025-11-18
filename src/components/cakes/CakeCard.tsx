import React, { memo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Cake } from '../../types/cake.types';
import { useCake } from '../../contexts/CakeContext';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface CakeCardProps {
    cake: Cake;
    onPress?: (cake: Cake) => void;
    showActions?: boolean;
}

const CakeCard: React.FC<CakeCardProps> = ({
    cake,
    onPress,
    showActions = true
}) => {
    const { addToFavorites, removeFromFavorites, markAsBaked, collection } = useCake();

    // Memoize expensive computations
    const isFavorite = collection?.favoriteCakes.includes(cake.id) || false;
    const totalTime = cake.prepTime + cake.cookTime;
    const tags = cake.tags.slice(0, 3); // Limit tags to first 3

    // Memoize callback functions to prevent re-renders
    const handleFavoriteToggle = useCallback(async () => {
        try {
            if (isFavorite) {
                await removeFromFavorites(cake.id);
            } else {
                await addToFavorites(cake.id);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }, [isFavorite, cake.id, addToFavorites, removeFromFavorites]);

    const handleMarkAsBaked = useCallback(async () => {
        try {
            await markAsBaked(cake.id);
        } catch (error) {
            console.error('Error marking as baked:', error);
        }
    }, [cake.id, markAsBaked]);

    const handleCardPress = useCallback(() => {
        onPress?.(cake);
    }, [cake, onPress]);

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity
                style={styles.card}
                onPress={handleCardPress}
                activeOpacity={0.7}
            >
                {/* Cake Image */}
                <View style={styles.imageContainer}>
                    {cake.imageUrl ? (
                        <Image
                            source={{ uri: cake.imageUrl }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: cake.flavor.color }]}>
                            <Text style={styles.placeholderEmoji}>{cake.flavor.emoji}</Text>
                        </View>
                    )}
                    {!cake.isUnlocked && (
                        <View style={styles.lockOverlay}>
                            <Text style={styles.lockText}>🔒</Text>
                        </View>
                    )}
                </View>

                {/* Cake Info */}
                <View style={styles.info}>
                    <ThemedText style={styles.name}>{cake.name}</ThemedText>
                    <ThemedText style={styles.description} numberOfLines={2}>
                        {cake.description}
                    </ThemedText>

                    {/* Tags */}
                    <View style={styles.tags}>
                        {tags.map((tag, index) => (
                            <View key={`${cake.id}-tag-${index}`} style={[styles.tag, { backgroundColor: cake.category.color }]}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Details */}
                    <View style={styles.details}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>⏱️</Text>
                            <ThemedText style={styles.detailText}>
                                {totalTime}m
                            </ThemedText>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>⭐</Text>
                            <ThemedText style={styles.detailText}>
                                {cake.rating} ({cake.reviewCount})
                            </ThemedText>
                        </View>
                        <View style={styles.detailItem}>
                            <View style={[styles.difficultyIndicator, { backgroundColor: cake.difficulty.color }]} />
                            <ThemedText style={styles.detailText}>
                                {cake.difficulty.name}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Flavor and Category */}
                    <View style={styles.metaInfo}>
                        <View style={[styles.metaBadge, { backgroundColor: cake.flavor.color }]}>
                            <Text style={styles.metaBadgeText}>{cake.flavor.emoji} {cake.flavor.name}</Text>
                        </View>
                        <ThemedText style={styles.categoryText}>{cake.category.name}</ThemedText>
                    </View>
                </View>

                {/* Actions */}
                {showActions && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={handleFavoriteToggle}
                        >
                            <Text style={styles.favoriteIcon}>
                                {isFavorite ? '❤️' : '🤍'}
                            </Text>
                        </TouchableOpacity>

                        {cake.isUnlocked && (
                            <TouchableOpacity
                                style={styles.bakeButton}
                                onPress={handleMarkAsBaked}
                            >
                                <Text style={styles.bakeButtonText}>Baked ✓</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </ThemedView>
    );
};

// Export memoized component to prevent unnecessary re-renders
export const MemoizedCakeCard = memo(CakeCard);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 64,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockText: {
        fontSize: 32,
    },
    info: {
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 12,
        lineHeight: 20,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    detailText: {
        fontSize: 12,
        opacity: 0.8,
    },
    difficultyIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    metaBadgeText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
    },
    categoryText: {
        fontSize: 12,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    favoriteButton: {
        padding: 8,
    },
    favoriteIcon: {
        fontSize: 24,
    },
    bakeButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bakeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
