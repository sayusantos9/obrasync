import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const profileStyles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,.4)',
    borderRadius: 39,
    borderWidth: 4,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },
  role: {
    color: 'rgba(255,255,255,.76)',
    fontSize: 13,
    marginTop: 3,
  },
  email: { color: 'rgba(255,255,255,.62)', fontSize: 11, marginTop: 4 },
  toggleShell: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 52,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderColor: '#F2C8C4',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 52,
  },
  logoutText: { color: theme.colors.danger, fontSize: 14, fontWeight: '900', marginLeft: 8 },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 4,
    marginVertical: 18,
  },
});
