import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useController } from 'react-hook-form';
import { theme } from '../../theme';

const PLACEHOLDER_COLOR = '#968E99';

export function FormField({ control, name, rules, label, containerStyle, inputStyle, ...inputProps }) {
  const {
    field: { value, onBlur, onChange },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          {...inputProps}
          value={value}
          onBlur={onBlur}
          onChangeText={onChange}
          style={[styles.input, inputProps.multiline && styles.multilineInput, inputStyle]}
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
      </View>
      {!!error?.message && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 16,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: theme.colors.danger },
  input: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 5 },
});
