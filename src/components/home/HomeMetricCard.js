import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity} from '../accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../accessibility/ReadableText';

import styled from 'styled-components/native';

const Card = styled(AccessibleTouchableOpacity)`
  width: 158px;
  min-height: 126px;
  margin-right: 10px;
  padding: 14px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

const IconBox = styled(AccessibleView)`
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 12px;
`;

const Label = styled(ReadableText)`
  margin-top: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const Value = styled(ReadableText)`
  margin-top: 4px;
  color: ${({ $color, theme }) => $color || theme.colors.text};
  font-size: 18px;
  font-weight: 900;
`;

export function HomeMetricCard({ metric, onPress }) {
  return (
    <Card onPress={onPress}>
      <IconBox $backgroundColor={metric.backgroundColor}>
        <Ionicons
          name={metric.icon}
          size={22}
          color={metric.iconColor ?? metric.color}
        />
      </IconBox>
      <Label>{metric.label}</Label>
      <Value $color={metric.color}>{metric.value}</Value>
    </Card>
  );
}
