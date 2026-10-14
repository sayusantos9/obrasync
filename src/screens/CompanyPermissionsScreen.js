import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { ROLE_ACCESS, ROLE_LABELS, ROLE_OPTIONS, USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';

export function CompanyPermissionsScreen() {
  const theme = useTheme();
  const { currentUser, members, openScreen, selectedProject } = useApp();
  const isMaster = currentUser?.role === USER_ROLES.MASTER;

  return (
    <Screen>
      <ScreenHeader title="Empresas e permissões" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark-outline" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>{currentUser.companyName}</Text>
              <Text style={styles.heroSubtitle}>Obra ativa: {selectedProject?.name || 'Nenhuma obra selecionada'}</Text>
            </View>
          </View>

          {isMaster && (
            <View style={styles.actionRow}>
              <ActionButton
                color={theme.colors.accent}
                icon="person-add-outline"
                label="Adicionar funcionário"
                onPress={() => openScreen(SCREENS.CREATE_MEMBER)}
              />
              <ActionButton
                color={theme.colors.primary}
                icon="business-outline"
                label="Cadastrar empresa"
                onPress={() => openScreen(SCREENS.CREATE_COMPANY)}
              />
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Equipe e acessos</Text>
            <Text style={[styles.count, { color: theme.colors.primary }]}>{members.length} usuário(s)</Text>
          </View>

          {members.map((member) => (
            <View
              accessible
              accessibilityLabel={`${member.name}. ${ROLE_LABELS[member.role] || member.role}.`}
              key={member.id}
              style={[styles.memberCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}> 
                <Ionicons name="person-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{member.name}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{member.email}</Text>
                <Text style={[styles.roleLabel, { color: theme.colors.accent }]}>{ROLE_LABELS[member.role] || member.role}</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.sectionTitle, styles.permissionHeading, { color: theme.colors.text }]}>Perfis de permissão</Text>
          {ROLE_OPTIONS.map((role) => (
            <View
              accessible
              accessibilityLabel={`${ROLE_LABELS[role]}. ${ROLE_ACCESS[role]}`}
              key={role}
              style={[styles.permissionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Text style={[styles.name, { color: theme.colors.text }]}>{ROLE_LABELS[role]}</Text>
              <Text style={[styles.permissionText, { color: theme.colors.textMuted }]}>{ROLE_ACCESS[role]}</Text>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
  );
}

function ActionButton({ color, icon, label, onPress }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.actionButton, { backgroundColor: color }]}
    >
      <Ionicons name={icon} size={20} color="#FFFFFF" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', borderRadius: 22, flexDirection: 'row', marginTop: 18, padding: 18 },
  heroIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 15, height: 50, justifyContent: 'center', width: 50 },
  heroInfo: { flex: 1, marginLeft: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroSubtitle: { color: 'rgba(255,255,255,.72)', fontSize: 11, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  actionButton: { alignItems: 'center', borderRadius: 15, flex: 1, justifyContent: 'center', minHeight: 72, padding: 8 },
  actionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', marginTop: 5, textAlign: 'center' },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  sectionTitle: { fontSize: 19, fontWeight: '900' },
  count: { fontSize: 11, fontWeight: '900' },
  memberCard: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginTop: 9, padding: 13 },
  avatar: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  memberInfo: { flex: 1, marginLeft: 11 },
  name: { fontSize: 13, fontWeight: '900' },
  meta: { fontSize: 10, marginTop: 3 },
  roleLabel: { fontSize: 10, fontWeight: '900', marginTop: 4 },
  permissionHeading: { marginTop: 24 },
  permissionCard: { borderRadius: 17, borderWidth: 1, marginTop: 9, padding: 14 },
  permissionText: { fontSize: 11, lineHeight: 17, marginTop: 5 },
});
