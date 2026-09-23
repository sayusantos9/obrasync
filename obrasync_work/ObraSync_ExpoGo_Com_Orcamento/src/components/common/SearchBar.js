import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Wrapper = styled.View`height: 54px; margin-top: -10px; border-radius: 18px; padding: 0 16px; background-color: white; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border}; elevation: 4; shadow-color: #260D35; shadow-opacity: .08; shadow-radius: 12px;`;
const Input = styled.TextInput`flex: 1; margin-left: 10px; font-size: 16px; color: ${({ theme }) => theme.colors.text};`;
const Filter = styled.TouchableOpacity`width: 36px; height: 36px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.primarySoft}; align-items: center; justify-content: center;`;

export function SearchBar({ value, onChangeText, placeholder = 'O que você precisa?' }) {
  return <Wrapper><Ionicons name="search" size={23} color="#756D7A" /><Input value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#968E99" /><Filter><Ionicons name="options" size={20} color="#5A1B73" /></Filter></Wrapper>;
}
