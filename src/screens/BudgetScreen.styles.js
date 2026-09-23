import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const budgetStyles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primaryDark,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,.74)',
    fontSize: 13,
    marginTop: 5,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,.13)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  versionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  newBudgetButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  newBudgetText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginLeft: 8 },
  createdSection: { marginTop: 20 },
  createdSectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  documentTop: { alignItems: 'flex-start', flexDirection: 'row' },
  documentInfo: { flex: 1 },
  documentNumber: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  documentTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900', marginTop: 3 },
  documentMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 5 },
  documentTotal: { color: theme.colors.primaryDark, fontSize: 18, fontWeight: '900', marginTop: 12 },
  deleteButton: { padding: 6 },
});
