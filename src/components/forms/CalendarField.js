import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useController } from 'react-hook-form';
import { theme } from '../../theme';

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function parseDate(value) {
  if (!value) return new Date();
  const [day, month, year] = String(value).split('/').map(Number);
  const parsed = new Date(year, (month || 1) - 1, day || 1);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getCalendarDays(referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstWeekDay = new Date(year, month, 1).getDay();
  const numberOfDays = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekDay }, () => null);

  for (let day = 1; day <= numberOfDays; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarField({ control, name, rules, label, placeholder = 'Selecione a data' }) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name, rules });
  const [isVisible, setIsVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(parseDate(value));
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  function changeMonth(offset) {
    setVisibleMonth((current) => new Date(
      current.getFullYear(),
      current.getMonth() + offset,
      1,
    ));
  }

  function selectDate(date) {
    onChange(formatDate(date));
    setVisibleMonth(date);
    setIsVisible(false);
  }

  function isSelected(date) {
    if (!date || !value) return false;
    return formatDate(date) === value;
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          setVisibleMonth(parseDate(value));
          setIsVisible(true);
        }}
        style={[styles.field, error && styles.fieldError]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
      {!!error?.message && <Text style={styles.errorText}>{error.message}</Text>}

      <Modal transparent animationType="fade" visible={isVisible} onRequestClose={() => setIsVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.arrowButton} onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={22} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>
              <TouchableOpacity style={styles.arrowButton} onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((weekDay, index) => (
                <Text key={`${weekDay}-${index}`} style={styles.weekDay}>{weekDay}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((date, index) => (
                <View key={date ? date.toISOString() : `empty-${index}`} style={styles.dayCell}>
                  {!!date && (
                    <TouchableOpacity
                      onPress={() => selectDate(date)}
                      style={[styles.dayButton, isSelected(date) && styles.selectedDay]}
                    >
                      <Text style={[styles.dayText, isSelected(date) && styles.selectedDayText]}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 16,
  },
  field: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 14,
  },
  fieldError: { borderColor: theme.colors.danger },
  value: { color: theme.colors.text, flex: 1, fontSize: 15 },
  placeholder: { color: '#968E99' },
  errorText: { color: theme.colors.danger, fontSize: 12, marginTop: 5 },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(38,13,53,.46)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  monthTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekDay: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    width: '14.2857%',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { alignItems: 'center', height: 44, justifyContent: 'center', width: '14.2857%' },
  dayButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  selectedDay: { backgroundColor: theme.colors.primary },
  dayText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  selectedDayText: { color: '#FFFFFF' },
  closeButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  closeText: { color: theme.colors.primary, fontSize: 14, fontWeight: '800' },
});
