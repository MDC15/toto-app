import React, { forwardRef } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
    label: string;
    multiline?: boolean;
}

const InputField = forwardRef<TextInput, InputFieldProps>(({ label, style, ...props }, ref) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            ref={ref}
            style={[styles.input, props.multiline && styles.multiline, style]}
            placeholderTextColor="#888"
            {...props}
        />
    </View>
));

InputField.displayName = "InputField";

export default InputField;

const styles = StyleSheet.create({
    container: { marginBottom: 18 },
    label: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        color: "#111",
    },
    multiline: { minHeight: 100, textAlignVertical: "top", paddingVertical: 12 },
});
