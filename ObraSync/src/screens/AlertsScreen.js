import { Ionicons } from '@expo/vector-icons';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { alerts } from '../data/mockData';
import {
  AlertCard,
  AlertIcon,
  AlertInfo,
  AlertTitle,
  Description,
  FilterChip,
  FilterRow,
  FilterText,
  Header,
  MarkButton,
  Time,
  Title,
} from './AlertsScreen.styles';

const ALERT_FILTERS = ['Todos', 'Custos', 'Prazos', 'Aprovações'];
const ALERT_PALETTE = {
  danger: { backgroundColor: '#FBE9E7', color: '#B5473E' },
  warning: { backgroundColor: '#FFF4D6', color: '#B8810D' },
  info: { backgroundColor: '#EDE6F1', color: '#5A1B73' },
};

export function AlertsScreen() {
  return (
    <Screen>
      <Scroll>
        <Header>
          <Title>Alertas</Title>
          <MarkButton>
            <Ionicons name="checkmark-done" size={25} color="white" />
          </MarkButton>
        </Header>

        <Content>
          <FilterRow>
            {ALERT_FILTERS.map((label, index) => {
              const isActive = index === 0;

              return (
                <FilterChip key={label} $isActive={isActive}>
                  <FilterText $isActive={isActive}>{label}</FilterText>
                </FilterChip>
              );
            })}
          </FilterRow>

          {alerts.map((alert) => {
            const palette = ALERT_PALETTE[alert.type] ?? ALERT_PALETTE.info;

            return (
              <AlertCard key={alert.id}>
                <AlertIcon $backgroundColor={palette.backgroundColor}>
                  <Ionicons name={alert.icon} size={23} color={palette.color} />
                </AlertIcon>
                <AlertInfo>
                  <AlertTitle>{alert.title}</AlertTitle>
                  <Description>{alert.description}</Description>
                </AlertInfo>
                <Time>{alert.time}</Time>
              </AlertCard>
            );
          })}
        </Content>
      </Scroll>
    </Screen>
  );
}
