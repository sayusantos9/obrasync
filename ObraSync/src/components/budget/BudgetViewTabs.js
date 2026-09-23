import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';

export const BUDGET_VIEWS = {
  SUMMARY: 'summary',
  ITEMS: 'items',
};

const TABS = [
  { id: BUDGET_VIEWS.SUMMARY, label: 'Resumo' },
  { id: BUDGET_VIEWS.ITEMS, label: 'Itens do orçamento' },
];

export function BudgetViewTabs({ activeView, onChange }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === activeView;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(tab.id)}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 18,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },
  activeTab: { backgroundColor: theme.colors.surface },
  label: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '800' },
  activeLabel: { color: theme.colors.primary },
});
