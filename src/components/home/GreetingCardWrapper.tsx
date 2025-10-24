import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import GreetingCard from './GreetingCard';

// Giữ splash screen cho đến khi load xong font
SplashScreen.preventAutoHideAsync();

export default function GreetingCardWrapper() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function loadResources() {
            try {
                // Tải font
                await Font.loadAsync({
                    ...Ionicons.font,
                    ...MaterialCommunityIcons.font,
                });
            } catch (e) {
                console.warn('Font loading error:', e);
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        loadResources();
    }, []);

    if (!isReady) {
        // Giữ nguyên splash screen mặc định, không render gì cả
        return null;
    }

    return (
        <View style={{ flex: 1 }}>
            <GreetingCard username="user" />
        </View>
    );
}
