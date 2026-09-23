import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const projectsStyles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    paddingBottom: 25,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,.76)',
    fontSize: 13,
    marginBottom: 22,
  },
  sectionTitle: { marginTop: 24 },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 30,
    textAlign: 'center',
  },
  newButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 20,
  },
  newButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 7,
  },
});
