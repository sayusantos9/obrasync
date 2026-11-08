import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity,AccessibleScrollView,AccessibleScrollView as ScrollView,AccessibleImage,AccessibleImage as Image} from '../components/accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../components/accessibility/ReadableText';
import styled from 'styled-components/native';

const Intro = styled(ReadableText)`
  margin-top: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 21px;
`;

const Selector = styled(AccessibleScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 16px 0 0;
  padding-left: 0px;
`;

const Chip = styled(AccessibleTouchableOpacity)`
  min-height: 44px;
  margin-right: 8px;
  padding: 0 15px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, theme }) => (
    $isActive ? theme.colors.primary : theme.colors.surface
  )};
  border: 1px solid ${({ $isActive, theme }) => (
    $isActive ? theme.colors.primary : theme.colors.border
  )};
  border-radius: 20px;
`;

const ChipText = styled(ReadableText)`
  color: ${({ $isActive, theme }) => (
    $isActive ? 'white' : theme.colors.textMuted
  )};
  font-size: 12px;
  font-weight: 600;
`;

const LabelCard = styled(AccessibleView)`
  margin-top: 18px;
  padding: 20px;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
`;

const BrandRow = styled(AccessibleView)`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 20px;
  font-weight: 700;
`;

const BrandAccent = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.accent};
`;

const Status = styled(AccessibleView)`
  padding: 6px 9px;
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: 14px;
`;

const StatusText = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.success};
  font-size: 10px;
  font-weight: 700;
`;

const QrShell = styled(AccessibleView)`
  margin: 18px 0 12px;
  padding: 15px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.primarySoft};
  border-radius: 18px;
`;

const QrImage = styled(AccessibleImage)`
  width: 188px;
  height: 188px;
`;

const QrPlaceholder = styled(AccessibleView)`
  width: 188px;
  height: 188px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: 16px;
`;

const PlaceholderText = styled(ReadableText)`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 600;
  line-height: 17px;
  text-align: center;
`;

const MaterialName = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 19px;
  font-weight: 700;
  text-align: center;
`;

const MaterialCode = styled(ReadableText)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 600;
`;

const Divider = styled(AccessibleView)`
  height: 1px;
  margin: 17px 0;
  align-self: stretch;
  background-color: ${({ theme }) => theme.colors.border};
`;

const InfoRow = styled(AccessibleView)`
  margin-bottom: 9px;
  align-self: stretch;
  flex-direction: row;
  justify-content: space-between;
`;

const InfoLabel = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const InfoValue = styled(ReadableText)`
  max-width: 62%;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 600;
  text-align: right;
`;

const Hint = styled(AccessibleView)`
  margin-top: 14px;
  padding: 11px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.accentSoft};
  border-radius: 14px;
`;

const HintText = styled(ReadableText)`
  flex: 1;
  margin-left: 8px;
  color: #9B4B11;
  font-size: 11px;
  line-height: 16px;
`;

const GenerateButton = styled(AccessibleTouchableOpacity)`
  height: 56px;
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 17px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const GenerateText = styled(ReadableText)`
  margin-left: 8px;
  color: white;
  font-size: 15px;
  font-weight: 700;
`;

const ButtonRow = styled(AccessibleView)`
  margin: 16px 0 24px;
  flex-direction: row;
  justify-content: space-between;
`;

const Button = styled(AccessibleTouchableOpacity)`
  width: 48.5%;
  height: 54px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ $secondary, theme }) => (
    $secondary ? theme.colors.surface : theme.colors.accent
  )};
  border: 1px solid ${({ $secondary, theme }) => (
    $secondary ? theme.colors.primary : theme.colors.accent
  )};
  border-radius: 17px;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

const ButtonText = styled(ReadableText)`
  margin-left: 7px;
  color: ${({ $secondary, theme }) => (
    $secondary ? theme.colors.primary : theme.colors.primaryDark
  )};
  font-size: 13px;
  font-weight: 700;
`;

export const labelStyles = {
  Brand,
  BrandAccent,
  BrandRow,
  Button,
  ButtonRow,
  ButtonText,
  Chip,
  ChipText,
  Divider,
  GenerateButton,
  GenerateText,
  Hint,
  HintText,
  InfoLabel,
  InfoRow,
  InfoValue,
  Intro,
  LabelCard,
  MaterialCode,
  MaterialName,
  PlaceholderText,
  QrImage,
  QrPlaceholder,
  QrShell,
  Selector,
  Status,
  StatusText,
};
