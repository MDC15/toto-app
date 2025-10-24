import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingPage } from '@/components/onboarding/OnboardingPag';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const pages = [
    {
        id: '1',
        image: require('../../../assets/images/inapp/Onboarding.png'),
        title: 'Welcome back To-Do App',
        subtitle: 'Organize your life easily.',
    },
    {
        id: '2',
        image: require('../../../assets/images/inapp/Onboarding.png'),
        title: 'Effective work management',
        subtitle: 'Add, edit, and delete jobs quickly.',
    },
    {
        id: '3',
        image: require('../../../assets/images/inapp/Onboarding.png'),
        title: 'Never miss a thing',
        subtitle: 'Set reminders and priorities to stay on track.',
    },
];

export default function OnboardingScreen() {
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const scrollOffset = useRef(new Animated.Value(0)).current;
    const position = useRef(new Animated.Value(0)).current;

    const onPageScroll = useCallback(
        (event: { nativeEvent: { offset: number; position: number } }) => {
            scrollOffset.setValue(event.nativeEvent.offset);
            position.setValue(event.nativeEvent.position);
        },
        [position, scrollOffset]
    );

    const onPageSelected = useCallback(
        (event: { nativeEvent: { position: number } }) => {
            setCurrentPage(event.nativeEvent.position);
        },
        []
    );

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            pagerRef.current?.setPage(currentPage + 1);
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)');
    };

    const isLastPage = currentPage === pages.length - 1;

    return (
        <View style={styles.container}>
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageScroll={onPageScroll}
                onPageSelected={onPageSelected}
            >
                {pages.map((page, index) => (
                    <View key={page.id}>
                        <OnboardingPage
                            page={page}
                            index={index}
                            scrollOffset={scrollOffset}
                            position={position}
                        />
                    </View>
                ))}
            </PagerView>

            {/* Gradient overlay ở dưới */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)']}
                style={styles.gradientOverlay}
            />

            {/* Nút điều hướng */}
            <View
                style={[
                    styles.buttonContainer,
                    isLastPage && styles.centerButtonContainer,
                ]}
            >
                {!isLastPage && (
                    <OnboardingButton
                        onPress={handleSkip}
                        title="Skip"
                        variant="secondary"
                    />
                )}
                <OnboardingButton
                    onPress={handleNext}
                    title={isLastPage ? 'Get Started' : 'Continue'}
                    variant="primary"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    pagerView: { flex: 1 },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    centerButtonContainer: {
        justifyContent: 'center',
    },
});
