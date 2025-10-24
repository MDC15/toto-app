import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface OnboardingButtonProps {
    title: string;
    onPress: () => void;
    variant: 'primary' | 'secondary';
}

export function OnboardingButton(
    { title, onPress, variant }: OnboardingButtonProps) {
    const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
    const textStyle = variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;

    return (
        <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
            <Text style={textStyle}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    primaryButton: {
        backgroundColor: '#f97316',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
