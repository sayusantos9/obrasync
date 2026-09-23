import styled from 'styled-components/native';

const Intro = styled.Text`
  margin-top: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 21px;
`;

const Selector = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 16px -20px 0;
  padding-left: 20px;
`;

const Chip = styled.TouchableOpacity`
  height: 40px;
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

const ChipText = styled.Text`
  color: ${({ $isActive, theme }) => (
    $isActive ? 'white' : theme.colors.textMuted
  )};
  font-size: 12px;
  font-weight: 800;
`;

const LabelCard = styled.View`
  margin-top: 18px;
  padding: 20px;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
`;

const BrandRow = styled.View`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.Text`
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 20px;
  font-weight: 900;
`;

const BrandAccent = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
`;

const Status = styled.View`
  padding: 6px 9px;
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: 14px;
`;

const StatusText = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-size: 10px;
  font-weight: 900;
`;

const QrShell = styled.View`
  margin: 18px 0 12px;
  padding: 15px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.primarySoft};
  border-radius: 18px;
`;

const QrImage = styled.Image`
  width: 188px;
  height: 188px;
`;

const QrPlaceholder = styled.View`
  width: 188px;
  height: 188px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: 16px;
`;

const PlaceholderText = styled.Text`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 800;
  line-height: 17px;
  text-align: center;
`;

const MaterialName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 19px;
  font-weight: 900;
  text-align: center;
`;

const MaterialCode = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 800;
`;

const Divider = styled.View`
  height: 1px;
  margin: 17px 0;
  align-self: stretch;
  background-color: ${({ theme }) => theme.colors.border};
`;

const InfoRow = styled.View`
  margin-bottom: 9px;
  align-self: stretch;
  flex-direction: row;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

const InfoValue = styled.Text`
  max-width: 62%;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 800;
  text-align: right;
`;

const Hint = styled.View`
  margin-top: 14px;
  padding: 11px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.accentSoft};
  border-radius: 14px;
`;

const HintText = styled.Text`
  flex: 1;
  margin-left: 8px;
  color: #71540D;
  font-size: 11px;
  line-height: 16px;
`;

const GenerateButton = styled.TouchableOpacity`
  height: 56px;
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 17px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const GenerateText = styled.Text`
  margin-left: 8px;
  color: white;
  font-size: 15px;
  font-weight: 900;
`;

const ButtonRow = styled.View`
  margin: 16px 0 24px;
  flex-direction: row;
  justify-content: space-between;
`;

const Button = styled.TouchableOpacity`
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

const ButtonText = styled.Text`
  margin-left: 7px;
  color: ${({ $secondary, theme }) => (
    $secondary ? theme.colors.primary : theme.colors.primaryDark
  )};
  font-size: 13px;
  font-weight: 900;
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
