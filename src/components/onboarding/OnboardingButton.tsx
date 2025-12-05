import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface OnboardingButtonProps {
    title: string;
    onPress: () => void;
    variant: 'primary' | 'secondary' | 'text';
    style?: ViewStyle | TextStyle; // Add style prop for custom styling
}

export function OnboardingButton(
    { title, onPress, variant, style }: OnboardingButtonProps) {
    let buttonStyle: ViewStyle;
    let textStyle: TextStyle;

    switch (variant) {
        case 'primary':
            buttonStyle = styles.primaryButton;
            textStyle = styles.primaryButtonText;
            break;
        case 'secondary':
            buttonStyle = styles.secondaryButton;
            textStyle = styles.secondaryButtonText;
            break;
        case 'text':
            buttonStyle = styles.textButton;
            textStyle = styles.textButtonText;
            break;
        default:
            buttonStyle = styles.primaryButton;
            textStyle = styles.primaryButtonText;
    }

    return (
        <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
            <Text style={[textStyle]}>{title}</Text>
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
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fff',
    },
    secondaryButtonText: {
        color: '#f97316',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textButton: {
        backgroundColor: 'transparent',
    },
    textButtonText: {
        color: '#ff9800', // Default text color for the 'text' variant
        fontSize: 16,
        fontWeight: 'bold',
    },
});
