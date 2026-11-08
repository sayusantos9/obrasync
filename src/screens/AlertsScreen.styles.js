import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity,AccessibleScrollView,AccessibleScrollView as ScrollView} from '../components/accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../components/accessibility/ReadableText';
import styled from 'styled-components/native';

export const Header = styled(AccessibleView)`
  padding: 52px 20px 24px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const Title = styled(ReadableText)`
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

export const MarkButton = styled(AccessibleTouchableOpacity)`
  padding: 10px;
`;

export const FilterRow = styled(AccessibleScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 20px -20px 6px;
  padding-left: 20px;
`;

export const FilterChip = styled(AccessibleTouchableOpacity)`
  height: 38px;
  margin-right: 8px;
  padding: 0 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, theme }) => (
    $isActive ? theme.colors.primary : 'white'
  )};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
`;

export const FilterText = styled(ReadableText)`
  color: ${({ $isActive, theme }) => (
    $isActive ? 'white' : theme.colors.textMuted
  )};
  font-size: 13px;
  font-weight: 800;
`;

export const AlertCard = styled(AccessibleTouchableOpacity)`
  margin-top: 12px;
  padding: 16px;
  flex-direction: row;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
`;

export const AlertIcon = styled(AccessibleView)`
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 15px;
`;

export const AlertInfo = styled(AccessibleView)`
  flex: 1;
  margin-left: 12px;
`;

export const AlertTitle = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 900;
`;

export const Description = styled(ReadableText)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 17px;
`;

export const Time = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
`;
