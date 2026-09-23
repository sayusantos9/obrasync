import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const addBudgetItemStyles = StyleSheet.create({
  introText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 18,
  },
  projectCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 16,
    padding: 14,
  },
  projectInfo: { flex: 1, marginLeft: 10 },
  projectLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '800' },
  projectName: { color: theme.colors.text, fontSize: 14, fontWeight: '900', marginTop: 2 },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 16,
  },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  submitButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 17,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 26,
  },
  disabledButton: { opacity: 0.6 },
  submitText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
});
