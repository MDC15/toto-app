import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AchievementsView } from '../../components/cakes/AchievementsView';
import CakeCollectionView from '../../components/cakes/CakeCollectionView';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useCake } from '../../contexts/CakeContext';
import { Achievement, Cake } from '../../types/cake.types';

export default function CakesPage() {
    const { collection, loading, error } = useCake();
    const [activeTab, setActiveTab] = useState<'collection' | 'achievements'>('collection');

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.loadingEmoji}>🎂</Text>
                    <ThemedText style={styles.loadingText}>Loading your cake collection...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.errorEmoji}>❌</Text>
                    <ThemedText style={styles.errorTitle}>Oops! Something went wrong</ThemedText>
                    <ThemedText style={styles.errorMessage}>{error}</ThemedText>
                    <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerEmoji}>🎂</Text>
                        <View>
                            <ThemedText style={styles.title}>Cake Collection</ThemedText>
                            <ThemedText style={styles.subtitle}>
                                {collection?.totalBaked || 0} cakes baked • {collection?.currentStreak || 0} day streak
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.progressCircle}>
                        <Text style={styles.progressText}>
                            {collection?.bakingStats.completionRate || 0}%
                        </Text>
                        <ThemedText style={styles.progressLabel}>Complete</ThemedText>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>🍰</Text>
                        <ThemedText style={styles.statValue}>{collection?.unlockedCakes.length || 0}</ThemedText>
                        <ThemedText style={styles.statLabel}>Unlocked</ThemedText>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>❤️</Text>
                        <ThemedText style={styles.statValue}>{collection?.favoriteCakes.length || 0}</ThemedText>
                        <ThemedText style={styles.statLabel}>Favorites</ThemedText>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>🏆</Text>
                        <ThemedText style={styles.statValue}>
                            {collection?.achievements.filter((a: Achievement) => a.isUnlocked).length || 0}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Achievements</ThemedText>
                    </View>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabNavigation}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'collection' && styles.tabActive
                        ]}
                        onPress={() => setActiveTab('collection')}
                    >
                        <Text style={[
                            styles.tabIcon,
                            activeTab === 'collection' && styles.tabIconActive
                        ]}>🍰</Text>
                        <Text style={[
                            styles.tabText,
                            activeTab === 'collection' && styles.tabTextActive
                        ]}>Collection</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'achievements' && styles.tabActive
                        ]}
                        onPress={() => setActiveTab('achievements')}
                    >
                        <Text style={[
                            styles.tabIcon,
                            activeTab === 'achievements' && styles.tabIconActive
                        ]}>🏆</Text>
                        <Text style={[
                            styles.tabText,
                            activeTab === 'achievements' && styles.tabTextActive
                        ]}>Achievements</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {activeTab === 'collection' ? (
                        <CakeCollectionView
                            title=""
                            showFilters={true}
                            onCakePress={(cake: Cake) => {
                                // Handle cake press - could navigate to detail view
                                console.log('Cake pressed:', cake.name);
                            }}
                        />
                    ) : (
                        <AchievementsView
                            showUnlockedOnly={false}
                            onAchievementPress={(achievementId: string) => {
                                // Handle achievement press
                                console.log('Achievement pressed:', achievementId);
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 2,
    },
    progressCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressLabel: {
        color: 'white',
        fontSize: 10,
        opacity: 0.8,
    },
    quickStats: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
    },
    tabNavigation: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabActive: {
        backgroundColor: '#007AFF',
    },
    tabIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    tabIconActive: {
        color: 'white',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: 'white',
    },
    content: {
        flex: 1,
    },
});
