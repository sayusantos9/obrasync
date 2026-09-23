import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const requestMaterialStyles = StyleSheet.create({
  introText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
    marginTop: 20,
  },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  attachmentButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    justifyContent: 'center',
    marginTop: 20,
  },
  attachmentText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  offlineNotice: {
    alignItems: 'center',
    backgroundColor: '#FFF4D6',
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
  },
  offlineText: { color: '#71540D', flex: 1, fontSize: 12, marginLeft: 8 },
  submitButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    marginVertical: 24,
  },
  disabledButton: { opacity: 0.55 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
