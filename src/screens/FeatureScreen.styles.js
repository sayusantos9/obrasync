import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity} from '../components/accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../components/accessibility/ReadableText';
import styled from 'styled-components/native';

export const Summary = styled(AccessibleView)`
  margin-top: 20px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.primaryDark};
  border-radius: 22px;
`;

export const Eyebrow = styled(ReadableText)`
  color: #9EC5EA;
  font-size: 12px;
  font-weight: 800;
`;

export const Big = styled(ReadableText)`
  margin-top: 8px;
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

export const Muted = styled(ReadableText)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 19px;
`;

export const Section = styled(ReadableText)`
  margin: 24px 0 4px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 19px;
  font-weight: 900;
`;

export const Card = styled(AccessibleTouchableOpacity)`
  margin-top: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

export const Row = styled(AccessibleView)`
  flex-direction: row;
  align-items: center;
`;

export const Icon = styled(AccessibleView)`
  width: 44px;
  height: 44px;
  margin-right: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor || '#EAF3FB'};
  border-radius: 14px;
`;

export const Flex = styled(AccessibleView)`
  flex: 1;
`;

export const Title = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 900;
`;

export const Value = styled(ReadableText)`
  color: ${({ $color, theme }) => $color || theme.colors.text};
  font-size: 16px;
  font-weight: 900;
`;

export const Pill = styled(AccessibleView)`
  padding: 6px 9px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 20px;
`;

export const PillText = styled(ReadableText)`
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 900;
`;

export const PrimaryButton = styled(AccessibleTouchableOpacity)`
  height: 54px;
  margin-top: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
`;

export const PrimaryButtonText = styled(ReadableText)`
  color: white;
  font-size: 15px;
  font-weight: 900;
`;

export const ActionRow = styled(AccessibleView)`
  margin-top: 18px;
  flex-direction: row;
  justify-content: space-between;
`;

export const ActionButton = styled(AccessibleTouchableOpacity)`
  width: 48.5%;
  min-height: 78px;
  padding: 12px;
  justify-content: space-between;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 17px;
`;

export const ActionText = styled(ReadableText)`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 900;
`;
