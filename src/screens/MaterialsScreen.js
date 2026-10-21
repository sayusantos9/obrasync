import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { SearchBar } from '../components/common/SearchBar';
import { Screen } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';
import { fetchInputCatalog } from '../services/inputCatalogService';
import { CATALOG_ROLES, filterInputCatalog } from '../utils/inputCatalog';
import { formatCurrency } from '../utils/currency';

export function MaterialsScreen() {
  const theme = useTheme();
  const { currentUser, openScreen, selectedProject } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [bank, setBank] = useState('Todas');
  const [expandedId, setExpandedId] = useState(null);
  const generation = useRef(0);
  const canRead = CATALOG_ROLES.includes(currentUser?.role) && Boolean(currentUser?.companyId);
  const canStock = ['MASTER', 'PURCHASING'].includes(currentUser?.role) && Boolean(selectedProject);

  async function reload() {
    const request = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const data = canRead ? await fetchInputCatalog() : [];
      if (request === generation.current) setItems(data);
    } catch (cause) {
      if (request === generation.current) setError(cause.message || 'Não foi possível carregar os insumos.');
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }

  useEffect(() => {
    setItems([]);
    reload();
    return () => { generation.current += 1; };
  }, [currentUser?.id, currentUser?.companyId, currentUser?.role]);

  const categories = useMemo(() => ['Todas', ...new Set(items.map((item) => item.category || 'Sem categoria'))], [items]);
  const banks = useMemo(() => ['Todas', ...new Set(items.map((item) => item.source_bank))], [items]);
  const visible = useMemo(() => filterInputCatalog(items, query, category, bank), [items, query, category, bank]);
  const surface = { backgroundColor: theme.colors.surface, borderColor: theme.colors.border };

  function filters(label, values, selected, onSelect) {
    return <View style={styles.filterBlock}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {values.map((value) => <TouchableOpacity key={value} accessibilityRole="button"
          accessibilityState={{ selected: selected === value }} onPress={() => onSelect(value)}
          style={[styles.chip, { backgroundColor: selected === value ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: selected === value ? '#FFFFFF' : theme.colors.text }}>{value}</Text>
        </TouchableOpacity>)}
      </ScrollView>
    </View>;
  }

  const header = <View>
    <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.title}>Insumos e materiais</Text>
      <Text style={styles.subtitle}>Materiais de referência para as empresas</Text>
      <View style={styles.search}><SearchBar value={query} onChangeText={setQuery} placeholder="Descrição, código ou unidade" /></View>
    </View>
    <View style={styles.headerContent}>
      {canStock && <TouchableOpacity accessibilityRole="button" onPress={() => openScreen(SCREENS.STOCK)}
        style={[styles.stockAction, { backgroundColor: theme.colors.primarySoft }]}>
        <Ionicons name="cube-outline" size={21} color={theme.colors.primary} />
        <Text style={[styles.actionText, { color: theme.colors.primary }]}>Estoque da obra</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </TouchableOpacity>}
      <Text style={[styles.notice, { color: theme.colors.textMuted }]}>Preços de referência da planilha. A data-base não foi informada. As quantidades de referência não representam saldo em estoque.</Text>
      {canRead && <>
        {filters('CATEGORIA NA PLANILHA', categories, category, setCategory)}
        {filters('BASE DE ORIGEM', banks, bank, setBank)}
        <View style={styles.summary}>
          <Text style={[styles.count, { color: theme.colors.text }]}>{visible.length} de {items.length} insumos</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar catálogo" disabled={loading} onPress={reload}>
            <Ionicons name="refresh-outline" size={23} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </>}
      {error ? <View style={[styles.message, surface]}>
        <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>Falha ao atualizar o catálogo. {error}</Text>
        {items.length > 0 && <Text style={{ color: theme.colors.textMuted }}>Exibindo a última consulta carregada.</Text>}
        <TouchableOpacity accessibilityRole="button" onPress={reload}><Text style={[styles.retry, { color: theme.colors.primary }]}>Tentar novamente</Text></TouchableOpacity>
      </View> : null}
    </View>
  </View>;

  function renderItem({ item }) {
    const expanded = expandedId === item.id;
    return <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }}
      onPress={() => setExpandedId(expanded ? null : item.id)} style={[styles.card, surface]}>
      <View style={styles.row}>
        <Text style={[styles.code, { color: theme.colors.primary }]}>{item.source_bank} · {item.source_code || item.catalog_code}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
      </View>
      <Text style={[styles.name, { color: theme.colors.text }]}>{item.description}</Text>
      <Text style={[styles.meta, { color: theme.colors.textMuted }]}>Material · Unidade: {item.unit}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>PREÇO DE REFERÊNCIA</Text>
        <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(Number(item.reference_unit_price))} / {item.unit}</Text>
      </View>
      {expanded && <View style={[styles.details, { borderColor: theme.colors.border }]}>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Identificador interno: {item.catalog_code}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Código de origem: {item.source_code || 'Não informado'}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Categoria na planilha: {item.category || 'Não informada'}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Quantidade de referência: {Number(item.reference_quantity).toLocaleString('pt-BR', { maximumFractionDigits: 12 })} {item.unit}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Valor da linha na planilha: {formatCurrency(Number(item.reference_value))}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Data-base: {item.reference_date || 'Não informada'}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>Origem: {item.source_file} · linha {item.source_row}</Text>
      </View>}
    </TouchableOpacity>;
  }

  return <Screen><FlatList data={visible} keyExtractor={(item) => item.id} renderItem={renderItem}
    extraData={expandedId} ListHeaderComponent={header} contentContainerStyle={styles.list}
    refreshing={loading && items.length > 0} onRefresh={canRead ? reload : undefined}
    ListEmptyComponent={<View style={[styles.message, styles.empty, surface]}>
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={{ color: theme.colors.textMuted }}>
        {!canRead ? 'Catálogo disponível para os perfis internos de uma empresa.' : error ? 'O catálogo não foi carregado.' : items.length ? 'Nenhum insumo encontrado para esses filtros.' : 'Nenhum insumo cadastrado na base.'}
      </Text>}
    </View>} /></Screen>;
}

const styles = StyleSheet.create({
  list: { paddingBottom: 110 },
  hero: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 22 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  subtitle: { color: '#FFFFFF', opacity: 0.8, fontSize: 12, marginTop: 6 },
  search: { marginTop: 16 },
  headerContent: { paddingHorizontal: 20 },
  stockAction: { padding: 14, borderRadius: 14, marginTop: 16, flexDirection: 'row', alignItems: 'center' },
  actionText: { flex: 1, marginLeft: 8, fontWeight: '800' },
  notice: { fontSize: 12, lineHeight: 18, marginTop: 16 },
  filterBlock: { marginTop: 16 },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 6 },
  chip: { paddingVertical: 9, paddingHorizontal: 12, marginRight: 8, borderRadius: 18, borderWidth: 1 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  count: { fontSize: 17, fontWeight: '800' },
  card: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderWidth: 1, borderRadius: 17 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: 11, fontWeight: '800', flex: 1 },
  name: { fontSize: 14, fontWeight: '700', marginTop: 8, lineHeight: 21 },
  meta: { fontSize: 12, marginTop: 8 },
  priceRow: { marginTop: 14 },
  price: { fontSize: 18, fontWeight: '900' },
  details: { borderTopWidth: 1, marginTop: 14, paddingTop: 10 },
  detail: { fontSize: 12, lineHeight: 20 },
  message: { padding: 18, borderWidth: 1, borderRadius: 14, marginBottom: 14 },
  empty: { marginHorizontal: 20 },
  retry: { fontWeight: '800', marginTop: 12 },
});
