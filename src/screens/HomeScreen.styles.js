import styled from 'styled-components/native';

export const QuickActionsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const MetricsList = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 0 -20px;
  padding-left: 20px;
`;

export const LoadingArea = styled.View`
  min-height: 126px;
  align-items: center;
  justify-content: center;
`;

export const ErrorCard = styled.TouchableOpacity`
  min-height: 90px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  border: 1px solid #F2C8C4;
  border-radius: 16px;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
  font-weight: 700;
  text-align: center;
`;
