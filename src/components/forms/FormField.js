import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useController } from 'react-hook-form';
import { useTheme } from 'styled-components/native';

export function FormField({ control, name, rules, label, containerStyle, inputStyle, ...inputProps }) {
  const theme = useTheme();
  const {
    field: { value, onBlur, onChange },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: 12 * theme.fontScale }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: error ? theme.colors.danger : theme.colors.border }]}> 
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel || label}
          value={value == null ? '' : String(value)}
          onBlur={onBlur}
          onChangeText={onChange}
          style={[styles.input, { color: theme.colors.text, fontSize: 15 * theme.fontScale }, inputProps.multiline && styles.multilineInput, inputStyle]}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>
      {!!error?.message && <Text accessibilityRole="alert" style={[styles.errorText, { color: theme.colors.danger }]}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '800', marginBottom: 7, marginTop: 16 },
  inputContainer: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', minHeight: 54, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14 },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  errorText: { fontSize: 12, marginTop: 5 },
});
