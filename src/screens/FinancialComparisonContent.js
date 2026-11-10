import {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {AccessibleView as View, AccessibleTouchableOpacity as Button, AccessibleTextInput as Input, AccessibleIonicons as Icon} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {InventoryScreen, useInventoryTheme} from '../components/layout/InventoryScreen';
import {ProjectSelector} from '../components/budget/ProjectSelector';
import {PROJECTION_MODES} from '../utils/financialComparison';
import {formatCurrency} from '../utils/currency';
import {reserveBudgetStock} from '../services/financialComparisonService';

const NAVY = '#010028', BLUE = '#0075E8';
const money = value => value == null ? 'Sem referência' : formatCurrency(value);
const quantity = value => Number(value || 0).toLocaleString('pt-BR', {maximumFractionDigits: 4});
const percent = value => value == null ? '—' : `${value.toFixed(1)}%`;

function IconTile({name, dark = false}) {
  return <View style={[styles.iconTile, dark && styles.iconTileDark]}><Icon name={name} size={23} color={dark ? '#70DFFF' : BLUE}/></View>;
}
function SectionTitle({children, subtitle}) {
  return <View style={styles.section}><View style={styles.sectionRow}><View style={styles.marker}/><Text accessibilityRole="header" style={styles.sectionTitle}>{children}</Text></View>{subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View>;
}
function Action({label, icon, onPress, disabled, primary = false}) {
  return <Button accessibilityRole="button" accessibilityState={{disabled: !!disabled}} disabled={disabled} onPress={onPress} style={[styles.action, primary && styles.actionPrimary, disabled && styles.disabled]}><Icon name={icon} size={21} color={primary ? '#FFFFFF' : BLUE}/><Text style={[styles.actionText, primary && styles.white]}>{label}</Text></Button>;
}
function Disclosure({title, subtitle, icon, children, initialOpen = false}) {
  const [open, setOpen] = useState(initialOpen);
  return <View style={styles.card}><Button accessibilityRole="button" accessibilityState={{expanded: open}} onPress={() => setOpen(v => !v)} style={styles.disclosure}><IconTile name={icon}/><View style={styles.flex}><Text style={styles.cardTitle}>{title}</Text>{subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View><Icon name={open ? 'chevron-up' : 'chevron-down'} size={21} color={BLUE}/></Button>{open && <View style={styles.disclosureBody}>{children}</View>}</View>;
}
function Choice({label, selected, onPress}) {
  return <Button accessibilityRole="radio" accessibilityState={{checked: selected}} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? BLUE : '#657386'}/><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Button>;
}
function Detail({label, value, emphasis = false}) {
  return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, emphasis && styles.blue]}>{value}</Text></View>;
}
function Notice({children, warning = false}) {
  return <View style={[styles.notice, warning && styles.warning]}><Icon name={warning ? 'alert-circle-outline' : 'information-circle-outline'} size={21} color={warning ? '#8A4B00' : '#0066BE'}/><Text accessibilityRole={warning ? 'alert' : undefined} style={[styles.noticeText, warning && styles.warningText]}>{children}</Text></View>;
}
function Metric({label, value, icon, hint, wide}) {
  return <View style={[styles.metric, wide && styles.fullWidth]}><IconTile name={icon}/><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{hint}</Text></View>;
}

export function FinancialComparisonContent({selectedProject, budgets, selected, setSelected, report, loading, error, refresh, tolerance, setTolerance, mode, setMode, validation, exporting, exportFile, query, setQuery, visible, limit, setLimit, scenarios, setScenarios, openMarket}) {
  const theme = useInventoryTheme();
  const dimensions = useWindowDimensions();
  const wideCards = dimensions.width < 370 || (theme.layoutFontScale || theme.fontScale || 1) * dimensions.fontScale > 1.3;
  const summary = report?.summary;
  const budget = budgets.find(item => item.id === selected);
  const budgetLabel = selected ? `${budget?.number || 'Orçamento'} · ${budget?.title || 'Versão selecionada'}` : 'Orçamento-base oficial';
  return <InventoryScreen title="Previsto × compra" bodyBackground="#EAF2FB">
    <Disclosure key={selectedProject?.id || 'no-project'} title={selectedProject?.name || 'Selecione uma obra'} subtitle="OBRA DA COMPARAÇÃO" icon="business-outline" initialOpen={!selectedProject}>
      <ProjectSelector/>
    </Disclosure>

    <View style={styles.heroFrame}><LinearGradient colors={['#00204A', '#003566', '#04538A']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.hero}>
      <View style={styles.heroTop}><IconTile name="analytics-outline" dark/><Text style={styles.eyebrow}>CONTROLE FINANCEIRO</Text></View>
      <Text accessibilityRole="header" style={styles.heroTitle}>Cada compra.{"\n"}<Text style={styles.cyan}>Mais clareza.</Text></Text>
      <Text style={styles.heroDescription}>Compare o orçamento com as compras e acompanhe a projeção dos insumos.</Text>
    </LinearGradient></View>

    <View style={styles.actions}><Action label="Atualizar" icon="refresh-outline" disabled={loading || !selectedProject} onPress={refresh}/><Action label="Preços de mercado" icon="search-outline" onPress={openMarket}/></View>
    {loading && <View style={styles.loading}><ActivityIndicator color={BLUE}/><Text accessibilityLiveRegion="polite" style={styles.muted}>Atualizando comparação…</Text></View>}
    {!!error && <Notice warning>{error} Use Atualizar para tentar novamente.</Notice>}

    {summary && <>
      <SectionTitle subtitle={`Atualizado em ${new Date(report.generatedAt).toLocaleString('pt-BR')}`}>Visão da obra</SectionTitle>
      <View style={styles.metricGrid}>
        <Metric label="Previsto" value={money(summary.planned)} hint="Orçamento sem BDI" icon="document-text-outline" wide={wideCards}/>
        <Metric label="Comprado" value={money(summary.actual)} hint="Compras confirmadas" icon="cart-outline" wide={wideCards}/>
      </View>
      <View style={styles.projection}>
        <View style={styles.projectionHeading}><IconTile name="trending-up-outline"/><View style={styles.flex}><Text style={styles.cardTitle}>Custo projetado</Text><Text style={styles.muted}>{PROJECTION_MODES[mode]}</Text></View></View>
        <Text style={styles.projectionValue}>{money(summary.projection)}</Text>
        <Text style={styles.muted}>Inclui o valor estimado do estoque externo reservado.</Text>
        <View style={styles.divider}/>
        <Detail label="Desembolso projetado" value={money(summary.projectedSpend)} emphasis/>
      </View>
      <View style={styles.metricGrid}>
        <Metric label="Aderência" value={summary.adherence == null ? 'Sem compra' : percent(summary.adherence)} hint={`Compras dentro da tolerância de ${tolerance}%`} icon="shield-checkmark-outline" wide={wideCards}/>
        <Metric label="Cobertura" value={percent(summary.coverage)} hint="Valor comprado com referência comparável" icon="layers-outline" wide={wideCards}/>
      </View>
      {report.warnings.map(warning => <Notice key={warning} warning>{warning}</Notice>)}
    </>}

    {selectedProject && <>
      <SectionTitle>Base e critérios</SectionTitle>
      <Disclosure title={budgetLabel} subtitle={`Data-base: ${report?.baseline?.base_date || 'não informada'}`} icon="documents-outline">
        <Text style={styles.muted}>Escolha uma versão para comparar. As versões não são somadas.</Text>
        <Choice label="Orçamento-base oficial" selected={!selected} onPress={() => setSelected('')}/>
        {budgets.map(item => <Choice key={item.id} label={`${item.number} · ${item.title} · revisão ${item.revisionNumber}`} selected={selected === item.id} onPress={() => setSelected(item.id)}/>)}
      </Disclosure>
      <Disclosure title="Critérios da comparação" subtitle={`${PROJECTION_MODES[mode]} · tolerância ${tolerance}%`} icon="options-outline">
        <Text style={styles.fieldLabel}>Tolerância superior de preço (%)</Text>
        <Input accessibilityLabel="Tolerância percentual" value={tolerance} onChangeText={setTolerance} keyboardType="decimal-pad" style={styles.input}/>
        <Text style={styles.muted}>Preços abaixo do orçamento são favoráveis. Compras sem referência não contam como aderentes.</Text>
        <Text accessibilityRole="header" style={styles.fieldLabel}>Critério de projeção</Text>
        {Object.entries(PROJECTION_MODES).map(([value, label]) => <Choice key={value} label={label} selected={mode === value} onPress={() => setMode(value)}/>)}
        {mode === 'scenario' && <Notice>Abra os detalhes de um insumo para simular preço, quantidade e condições. A simulação não cria pedidos.</Notice>}
      </Disclosure>
    </>}
    {!!validation && <Notice warning>{validation} Os valores exibidos usam parâmetros válidos de referência; a exportação fica indisponível até corrigir.</Notice>}

    {summary && <>
      <Disclosure title="De onde vem a diferença?" subtitle={`Comprado − previsto: ${money(summary.difference)}`} icon="git-compare-outline">
        <Detail label="Efeito preço" value={money(summary.priceEffect)}/>
        <Detail label="Efeito quantidade" value={money(summary.quantityEffect)}/>
        <Detail label="Efeito combinado" value={money(summary.combinedEffect)}/>
        <Detail label="Diferença sem referência" value={money(summary.unmatched)}/>
        <Detail label="Comprado − previsto" value={money(summary.difference)} emphasis/>
        <Notice>Uma diferença negativa durante a execução não significa economia final: ainda pode haver insumos a comprar.</Notice>
      </Disclosure>
      <Disclosure title="Compromissos e reservas" subtitle="Valores considerados na projeção" icon="cube-outline">
        <Detail label="Aprovado ainda não comprado" value={money(summary.committed)}/>
        <Detail label="Estoque externo estimado" value={money(summary.reservedEstimate)}/>
        <Text style={styles.muted}>A reserva cobre apenas estoque externo comprovável, sem descontar novamente as compras desta obra.</Text>
      </Disclosure>

      <SectionTitle subtitle="Leve a análise completa, com todos os indicadores.">Exportar comparação</SectionTitle>
      <View style={styles.actions}><Action label={exporting ? 'Exportando…' : 'Exportar PDF'} icon="document-text-outline" disabled={exporting || !!validation} primary onPress={() => exportFile('pdf')}/><Action label={exporting ? 'Exportando…' : 'Exportar Excel'} icon="grid-outline" disabled={exporting || !!validation} onPress={() => exportFile('excel')}/></View>

      <SectionTitle subtitle={`${visible.length} de ${report.rows.length} insumos · valores por unidade`}>Insumo por insumo</SectionTitle>
      <View style={styles.search}><Icon name="search-outline" size={23} color="#657386"/><Input accessibilityLabel="Buscar insumo na comparação" placeholder="Buscar insumo" value={query} onChangeText={value => {setQuery(value); setLimit(20);}} style={styles.searchInput}/>{!!query && <Button accessibilityRole="button" accessibilityLabel="Limpar busca" style={styles.clearSearch} onPress={() => {setQuery(''); setLimit(20);}}><Icon name="close-circle" size={22} color="#657386"/></Button>}</View>
      {visible.slice(0, limit).map(row => <FinancialRow key={row.key} row={row} mode={mode} wide={wideCards} scenario={scenarios[row.key] || {}} onScenario={value => setScenarios(old => ({...old, [row.key]: {...old[row.key], ...value}}))} projectId={selectedProject.id} budgetId={report.baseline?.id} canReserve={!!report.baseline?.id && report.baseline.id === report.project.baseline_budget_id} onReserved={refresh}/>)}
      {!visible.length && <View style={styles.empty}><IconTile name={query ? 'search-outline' : 'file-tray-outline'}/><Text style={styles.cardTitle}>{query ? 'Nenhum insumo encontrado' : 'A comparação começa com os insumos'}</Text><Text style={styles.emptyText}>{query ? 'Tente outro nome ou limpe a busca.' : 'Os itens do orçamento, das compras e do estoque desta obra aparecerão aqui.'}</Text></View>}
      {visible.length > limit && <Action label="Mostrar mais insumos" icon="add-circle-outline" onPress={() => setLimit(value => value + 20)}/>}

      <Disclosure title="Entenda os cálculos" subtitle="Fórmulas e limites desta análise" icon="information-circle-outline">
        <Text style={styles.explanation}>Aderência = valor das compras dentro do limite ÷ total comprado. A cobertura informa a parcela comprada que tem referência comparável.</Text>
        <Detail label="Efeito preço" value="Quantidade prevista × variação de preço"/>
        <Detail label="Efeito quantidade" value="Preço previsto × variação de quantidade"/>
        <Detail label="Efeito combinado" value="Variação de preço × variação de quantidade"/>
        <Detail label="Impacto de preço realizado" value="Efeito preço + efeito combinado"/>
        <Text style={styles.explanation}>Os três efeitos se somam à diferença comprado − previsto; os itens sem referência ficam separados.</Text>
        <Text style={styles.explanation}>A projeção inclui compras confirmadas, pedidos aprovados e necessidade adicional. O estoque externo reservado é estimado separadamente.</Text>
        <Notice>Despesas sem vínculo ao insumo e BDI ficam fora desta comparação.</Notice>
      </Disclosure>
    </>}
  </InventoryScreen>;
}

function FinancialRow({row, mode, wide, scenario, onScenario, projectId, budgetId, canReserve, onReserved}) {
  const [open, setOpen] = useState(false);
  const variation = row.percent == null ? 'Sem referência comparável' : `${row.percent > 0 ? '+' : ''}${row.percent.toFixed(2)}% no preço`;
  return <View style={styles.itemCard}>
    <View style={styles.itemHeading}><IconTile name="cube-outline"/><View style={styles.flex}><Text accessibilityRole="header" style={styles.cardTitle}>{row.description}</Text><Text style={styles.muted}>{row.status} · {row.unit}</Text></View></View>
    <View style={[styles.variation, row.percent > 0 && styles.warning]}><Icon name={row.percent == null ? 'information-circle-outline' : row.percent > 0 ? 'trending-up-outline' : 'trending-down-outline'} size={19} color={row.percent > 0 ? '#8A4B00' : '#0066BE'}/><Text style={[styles.variationText, row.percent > 0 && styles.warningText]}>{variation}</Text></View>
    <View style={styles.metricGrid}><View style={[styles.unitPrice, wide && styles.fullWidth]}><Text style={styles.muted}>Previsto / {row.unit}</Text><Text style={styles.unitValue}>{money(row.pp)}</Text></View><View style={[styles.unitPrice, wide && styles.fullWidth]}><Text style={styles.muted}>Real / {row.unit}</Text><Text style={[styles.unitValue, styles.blue]}>{money(row.pr)}</Text></View></View>
    <Detail label="Quantidade prevista" value={`${quantity(row.plannedQuantity)} ${row.unit}`}/>
    <Detail label="Quantidade comprada" value={`${quantity(row.purchasedQuantity)} ${row.unit}`}/>
    <Detail label="Saldo a contratar" value={`${quantity(row.remaining)} ${row.unit}`}/>
    <Detail label="Custo projetado" value={money(row.projection)} emphasis/>
    <Button accessibilityRole="button" accessibilityState={{expanded: open}} onPress={() => setOpen(value => !value)} style={styles.detailsButton}><Text style={styles.actionText}>{open ? 'Recolher detalhes' : mode === 'scenario' ? 'Detalhes e simulação' : 'Detalhes e reservas'}</Text><Icon name={open ? 'chevron-up' : 'chevron-down'} size={20} color={BLUE}/></Button>
    {open && <View style={styles.expandedItem}>
      <Text accessibilityRole="header" style={styles.fieldLabel}>Variações e projeção</Text>
      <Detail label="Efeito preço" value={money(row.priceEffect)}/><Detail label="Efeito quantidade" value={money(row.quantityEffect)}/><Detail label="Efeito combinado" value={money(row.combinedEffect)}/>
      <Detail label="Impacto de preço realizado" value={money(row.priceImpact)}/>
      <Detail label="Consumo registrado" value={`${quantity(row.consumed)} ${row.unit}`}/><Detail label="Reserva externa" value={`${quantity(row.reserved)} ${row.unit}`}/><Detail label="Já comprometido" value={`${quantity(row.committedQuantity)} ${row.unit}`}/>
      <Detail label="Preço da projeção" value={money(row.projectionPrice)}/>
      {row.fallback && <Notice>Sem histórico suficiente. A projeção usa a referência orçamentária.</Notice>}
      <Detail label="Compra adicional" value={`${quantity(row.projectedQuantity)} ${row.unit}`}/><Detail label="Desembolso projetado" value={money(row.projectedSpend)}/>
      {mode === 'scenario' && <View style={styles.inset}>
        <Text accessibilityRole="header" style={styles.cardTitle}>Simular cenário</Text><Text style={styles.muted}>Sem criar pedidos. Campos em branco usam a média e a necessidade calculada.</Text>
        {[['price', 'Preço líquido equivalente por unidade'], ['quantity', 'Quantidade adicional a comprar'], ['supplier', 'Fornecedor simulado'], ['terms', 'Condição de pagamento simulada']].map(([key, label]) => <View key={key}><Text style={styles.fieldLabel}>{label}</Text><Input accessibilityLabel={`${label}: ${row.description}`} value={scenario[key] || ''} onChangeText={value => onScenario({[key]: value})} keyboardType={['price', 'quantity'].includes(key) ? 'decimal-pad' : 'default'} style={styles.input}/></View>)}
      </View>}
      {row.stock.map(stock => <Reservation key={stock.materialId} stock={stock} description={row.description} projectId={projectId} budgetId={budgetId} canReserve={canReserve} onReserved={onReserved}/>)}
    </View>}
  </View>;
}

function Reservation({stock, description, projectId, budgetId, canReserve, onReserved}) {
  const [qty, setQty] = useState(String(stock.savedReservation)), [reason, setReason] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => setQty(String(stock.savedReservation)), [stock.savedReservation]);
  async function save() {
    const value = qty.trim() === '' ? null : Number(qty.replace(',', '.'));
    if (value == null || !Number.isFinite(value) || value < 0 || reason.trim().length < 5) return Alert.alert('Revise a reserva', 'Informe quantidade não negativa e motivo com 5 caracteres.');
    setBusy(true);
    try {await reserveBudgetStock(projectId, stock.materialId, value, reason.trim(), budgetId); onReserved();}
    catch (error) {Alert.alert('Não foi possível reservar', error.message);}
    finally {setBusy(false);}
  }
  return <View style={styles.inset}><Text accessibilityRole="header" style={styles.cardTitle}>Reserva de estoque</Text>
    <Detail label="Estoque físico" value={quantity(stock.quantity)}/><Detail label="Externo comprovável" value={quantity(stock.external)}/><Detail label="Reservado" value={quantity(stock.savedReservation)}/>
    <Text style={styles.muted}>A estimativa externa subtrai os recebimentos locais do saldo físico. Libere a reserva antes de consumir ou transferir o saldo reservado.</Text>
    {canReserve ? <>
      <Text style={styles.fieldLabel}>Quantidade a reservar</Text><Input accessibilityLabel={`Reserva externa de ${description}`} value={qty} onChangeText={setQty} keyboardType="decimal-pad" style={styles.input}/>
      <Text style={styles.fieldLabel}>Motivo da reserva ou liberação</Text><Input accessibilityLabel={`Motivo da reserva de ${description}`} placeholder="Descreva o motivo" value={reason} onChangeText={setReason} style={styles.input}/>
      <Action primary label={busy ? 'Salvando…' : 'Salvar reserva'} icon="checkmark-outline" disabled={busy} onPress={save}/><Text style={styles.muted}>Informe zero para liberar a reserva.</Text>
    </> : <Notice>Reservas são configuradas somente no orçamento-base oficial.</Notice>}
  </View>;
}

const styles = StyleSheet.create({
  flex: {flex: 1, minWidth: 0, gap: 4}, white: {color: '#FFFFFF'}, blue: {color: '#0066BE'}, cyan: {color: '#70DFFF'},
  card: {backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#D7E3F5', marginBottom: 12},
  disclosure: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, minHeight: 76},
  disclosureBody: {padding: 16, paddingTop: 0, gap: 10},
  cardTitle: {fontSize: 17, fontWeight: '700', color: NAVY, flexShrink: 1},
  muted: {fontSize: 13, lineHeight: 19, color: '#59677B'},
  iconTile: {width: 42, height: 44, borderRadius: 13, backgroundColor: '#E1F1FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  iconTileDark: {backgroundColor: '#064E75', borderColor: '#24B9ED', borderWidth: 1.5, width: 48, height: 48},
  heroFrame: {borderRadius: 23, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF', marginTop: 4, marginBottom: 16},
  hero: {padding: 22, gap: 16}, heroTop: {flexDirection: 'row', gap: 14, alignItems: 'center'},
  eyebrow: {color: '#A1DEF1', fontWeight: '800', fontSize: 10, letterSpacing: 1.6, flex: 1},
  heroTitle: {fontSize: 29, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.7},
  heroDescription: {fontSize: 14, lineHeight: 21, color: '#E1EDF9'},
  actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8},
  action: {flexGrow: 1, flexBasis: 140, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 15, minHeight: 52, borderWidth: 1, borderColor: '#CADFF3', borderRadius: 15},
  actionPrimary: {backgroundColor: BLUE, borderColor: BLUE}, actionText: {color: '#0066BE', fontSize: 14, fontWeight: '700', flexShrink: 1}, disabled: {opacity: 0.5},
  section: {marginTop: 22, marginBottom: 14, gap: 6}, sectionRow: {flexDirection: 'row', gap: 10, alignItems: 'center'}, marker: {width: 5, height: 23, borderRadius: 4, backgroundColor: '#008BEB'}, sectionTitle: {fontSize: 21, fontWeight: '800', color: NAVY, flex: 1},
  metricGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12},
  metric: {flexGrow: 1, flexBasis: '45%', minWidth: 0, backgroundColor: '#F9FBFF', borderWidth: 1, borderColor: '#D7E3F5', borderRadius: 18, padding: 16, gap: 8}, fullWidth: {flexBasis: '100%'},
  metricLabel: {fontSize: 14, color: NAVY, fontWeight: '700'}, metricValue: {fontSize: 22, fontWeight: '800', color: NAVY, letterSpacing: -0.4},
  projection: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BCD8F0', borderRadius: 20, padding: 18, gap: 10, marginBottom: 12}, projectionHeading: {flexDirection: 'row', gap: 12, alignItems: 'center'}, projectionValue: {fontSize: 30, fontWeight: '800', color: '#0066BE', letterSpacing: -0.7},
  divider: {height: 1, backgroundColor: '#E0E9F3', marginVertical: 4},
  detail: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 16, rowGap: 4, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#EDF2F8'}, detailLabel: {color: '#59677B', fontSize: 14, lineHeight: 21, flexGrow: 1, flexBasis: 120}, detailValue: {color: NAVY, fontSize: 14, lineHeight: 21, fontWeight: '700', flexShrink: 1},
  fieldLabel: {fontSize: 14, lineHeight: 21, fontWeight: '700', color: NAVY, marginTop: 10, marginBottom: 6},
  input: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCDCEC', borderRadius: 12, minHeight: 50, padding: 14, fontSize: 16, color: NAVY},
  choice: {flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 48, padding: 13, borderWidth: 1, borderColor: '#D7E3F5', borderRadius: 12, backgroundColor: '#FFFFFF'}, choiceSelected: {borderColor: BLUE, backgroundColor: '#EAF5FF'}, choiceText: {fontSize: 14, color: '#59677B', flex: 1}, choiceTextSelected: {color: '#005EA8', fontWeight: '700'},
  notice: {backgroundColor: '#E1F1FF', padding: 14, borderRadius: 14, flexDirection: 'row', gap: 10, marginVertical: 6}, noticeText: {flex: 1, fontSize: 13, lineHeight: 20, color: '#15557F'}, warning: {backgroundColor: '#FFF3DF'}, warningText: {color: '#8A4B00'},
  loading: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14},
  search: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D7E3F5', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 6, gap: 10, marginBottom: 14}, searchInput: {flex: 1, minWidth: 0, minHeight: 54, fontSize: 15, color: NAVY, paddingVertical: 12}, clearSearch: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
  itemCard: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D7E3F5', borderRadius: 20, padding: 16, marginBottom: 14}, itemHeading: {flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12}, variation: {alignSelf: 'flex-start', backgroundColor: '#EAF5FF', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 8, marginBottom: 14}, variationText: {fontSize: 12, lineHeight: 18, fontWeight: '700', color: '#0066BE', flexShrink: 1}, unitPrice: {flexGrow: 1, flexBasis: '45%', backgroundColor: '#F0F6FC', borderRadius: 12, padding: 12, gap: 5}, unitValue: {fontSize: 18, fontWeight: '800', color: NAVY},
  detailsButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: '#EAF5FF', borderRadius: 12, padding: 14, minHeight: 48, marginTop: 14}, expandedItem: {gap: 6, marginTop: 8}, inset: {backgroundColor: '#F0F6FC', padding: 14, borderRadius: 14, gap: 8, marginTop: 12}, explanation: {fontSize: 14, lineHeight: 22, color: '#59677B'},
  empty: {backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#D7E3F5', padding: 24, alignItems: 'center', gap: 12, marginBottom: 16}, emptyText: {fontSize: 14, lineHeight: 21, textAlign: 'center', color: '#59677B'},
});
