import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { responsive } from '@/constants/theme';

interface GreetingCardProps {
    username?: string;
}

const motivationalQuotes = [
    "Believe in yourself!",
    "You are stronger than you think.",
    "Make today amazing!",
    "Dream big. Work hard. Stay humble.",
    "Your only limit is your mind.",
];

// 🔹 Tách riêng icon container để memo hóa, không re-render khi quote đổi
const IconButtons = memo(({ navigation }: { navigation: any }) => (
    <View style={styles.iconContainer}>
        <TouchableOpacity
            onPress={() => navigation.navigate('pages/premium')}
            activeOpacity={0.7}
        >
            <MaterialCommunityIcons name="crown-outline" size={34} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => navigation.navigate('pages/settings')}
            activeOpacity={0.7}
        >
            <Ionicons name="settings-outline" size={34} color="#fff" />
        </TouchableOpacity>
    </View>
));

IconButtons.displayName = 'IconButtons';
function GreetingCardComponent({ username = 'User' }: GreetingCardProps) {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const navigation = useNavigation<any>();

    // 🔹 useCallback để không tạo hàm mới mỗi lần render
    const handleChangeQuote = useCallback(() => {
        setQuoteIndex(prevIndex => {
            let newIndex = Math.floor(Math.random() * motivationalQuotes.length);
            while (newIndex === prevIndex && motivationalQuotes.length > 1) {
                newIndex = Math.floor(Math.random() * motivationalQuotes.length);
            }
            return newIndex;
        });
    }, []);

    // 🔹 Đổi quote khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            handleChangeQuote();
        }, [handleChangeQuote])
    );

    // 🔹 useMemo để tránh tính toán lại quote mỗi lần render
    const currentQuote = useMemo(() => motivationalQuotes[quoteIndex], [quoteIndex]);

    return (
        <LinearGradient
            colors={['#E96479', '#F5B971']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <View style={styles.textContainer}>
                <Text style={styles.title}>Hello, {username}!</Text>
                <Text style={styles.subtitle}>{currentQuote}</Text>
            </View>

            <IconButtons navigation={navigation} />
        </LinearGradient>
    );
}

// 🔹 memo() tránh re-render khi props không đổi
GreetingCardComponent.displayName = 'GreetingCardComponent';
export default memo(GreetingCardComponent);

const styles = StyleSheet.create({
    container: {
        borderRadius: responsive.spacing(16),
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FDB833',
        padding: responsive.spacing(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        height: responsive.height(18), // Responsive height
        backgroundColor: '#E96479',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: responsive.spacing(4),
    },
    title: {
        color: '#fff',
        fontSize: responsive.fontSize(26),
        fontWeight: '700',
        marginBottom: responsive.spacing(6),
    },
    subtitle: {
        color: '#fff',
        fontSize: responsive.fontSize(16),
        opacity: 0.9,
    },
    iconContainer: {
        flexDirection: 'row',
        gap: responsive.spacing(16),
        marginLeft: responsive.spacing(12),
    },
});
