import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';
import { formatCompactCurrency } from '../../utils/currency';

export function BudgetSummaryPanel({
  budget,
  isGeneratingPdf,
  metrics,
  onGeneratePdf,
  onImportBudget,
}) {
  return (
    <>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>ORÇAMENTO PREVISTO</Text>
        <Text style={styles.budgetValue}>
          {formatCompactCurrency(metrics.plannedTotal)}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${metrics.progressPercentage}%`,
                backgroundColor: metrics.isOverBudget
                  ? theme.colors.danger
                  : theme.colors.accent,
              },
            ]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.smallText}>
            {metrics.usagePercentage.toFixed(1).replace('.', ',')}% realizado
          </Text>
          <Text style={styles.smallText}>
            {metrics.isOverBudget
              ? 'Acima do orçamento'
              : `${formatCompactCurrency(metrics.balance)} disponível`}
          </Text>
        </View>
      </View>

      <View style={styles.cards}>
        <SummaryCard
          icon="checkmark-circle-outline"
          iconColor={theme.colors.success}
          iconBackground={theme.colors.successSoft}
          label="Realizado"
          value={formatCompactCurrency(metrics.realizedTotal)}
        />
        <SummaryCard
          icon={metrics.isOverBudget ? 'warning-outline' : 'wallet-outline'}
          iconColor={metrics.isOverBudget ? theme.colors.danger : theme.colors.primary}
          iconBackground={metrics.isOverBudget ? theme.colors.dangerSoft : theme.colors.primarySoft}
          label={metrics.isOverBudget ? 'Excedido' : 'Saldo'}
          value={formatCompactCurrency(metrics.balance)}
          valueColor={metrics.isOverBudget ? theme.colors.danger : theme.colors.text}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={onImportBudget}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionText, styles.secondaryActionText]}>
            Importar XLSX/CSV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isGeneratingPdf}
          style={[styles.actionButton, styles.primaryAction]}
          onPress={onGeneratePdf}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator color={theme.colors.primaryDark} />
          ) : (
            <>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.colors.primaryDark}
              />
              <Text style={[styles.actionText, styles.primaryActionText]}>Gerar PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Serviços e composições</Text>
        <Text style={styles.sectionMeta}>{budget.services.length} grupos</Text>
      </View>

      {budget.services.map((service) => (
        <ServiceCard key={service.code} service={service} />
      ))}

      {metrics.addedItemsTotal > 0 && (
        <View style={styles.addedItemsNote}>
          <Ionicons name="add-circle-outline" size={19} color={theme.colors.primary} />
          <Text style={styles.addedItemsText}>
            Itens adicionados manualmente somam {formatCompactCurrency(metrics.addedItemsTotal)} ao orçamento previsto.
          </Text>
        </View>
      )}
    </>
  );
}

function SummaryCard({ icon, iconBackground, iconColor, label, value, valueColor }) {
  return (
    <View style={styles.miniCard}>
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={21} color={iconColor} />
      </View>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={[styles.miniValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function ServiceCard({ service }) {
  const executionPercentage = service.planned
    ? (service.realized / service.planned) * 100
    : 0;
  const balance = service.planned - service.realized;

  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceTop}>
        <View style={[styles.serviceIcon, { backgroundColor: service.backgroundColor }]}>
          <Ionicons name={service.icon} size={22} color={service.color} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCode}>
            Serviço {service.code} • {service.compositions} composições
          </Text>
        </View>
        <Text style={styles.serviceValue}>{formatCompactCurrency(service.planned)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Detail label="REALIZADO" value={formatCompactCurrency(service.realized)} />
        <Detail
          label="SALDO"
          value={formatCompactCurrency(balance)}
          valueColor={balance < 0 ? theme.colors.danger : theme.colors.success}
        />
        <Detail
          label="EXECUÇÃO"
          value={`${executionPercentage.toFixed(1).replace('.', ',')}%`}
        />
      </View>
    </View>
  );
}

function Detail({ label, value, valueColor }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  budgetValue: { color: theme.colors.text, fontSize: 30, fontWeight: '900', marginTop: 5 },
  progressTrack: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 5,
    height: 8,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  progressInfo: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  smallText: { color: theme.colors.textMuted, fontSize: 11 },
  cards: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  miniCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    width: '48.5%',
  },
  iconBox: { alignItems: 'center', borderRadius: 12, height: 36, justifyContent: 'center', marginBottom: 10, width: 36 },
  miniLabel: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' },
  miniValue: { color: theme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionButton: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
    padding: 10,
    width: '48.5%',
  },
  secondaryAction: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  primaryAction: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  actionText: { fontSize: 13, fontWeight: '900', marginLeft: 7 },
  secondaryActionText: { color: theme.colors.primary },
  primaryActionText: { color: theme.colors.primaryDark },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 26 },
  sectionTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  sectionMeta: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' },
  serviceCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 10,
    padding: 15,
  },
  serviceTop: { alignItems: 'flex-start', flexDirection: 'row' },
  serviceIcon: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  serviceInfo: { flex: 1, marginLeft: 11 },
  serviceName: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
  serviceCode: { color: theme.colors.textMuted, fontSize: 11, marginTop: 3 },
  serviceValue: { color: theme.colors.text, fontSize: 14, fontWeight: '900', marginLeft: 8 },
  detailRow: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 12,
  },
  detail: { flex: 1 },
  detailLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700' },
  detailValue: { color: theme.colors.text, fontSize: 12, fontWeight: '900', marginTop: 3 },
  addedItemsNote: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 14,
    padding: 13,
  },
  addedItemsText: { color: theme.colors.textMuted, flex: 1, fontSize: 12, lineHeight: 17, marginLeft: 8 },
});
