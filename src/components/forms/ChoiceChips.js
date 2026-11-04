import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useController } from 'react-hook-form';
import {useTheme} from 'styled-components/native';
import {useInventoryStyles} from '../layout/InventoryScreen';

export function ChoiceChips({ control, name, options, rules }) {
  const theme=useTheme();
  const styles=useInventoryStyles(makeStyles(theme));
  const {
    field: { value, onChange },
  } = useController({ control, name, rules });

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option === value;

        return (
          <TouchableOpacity
            key={option} accessibilityRole="button" accessibilityState={{selected:isSelected}}
            onPress={() => onChange(option)}
            style={[styles.chip, isSelected && styles.selectedChip]}
          >
            <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = theme => StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedChip: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '800' },
  selectedChipText: { color: theme.colors.primary },
});
