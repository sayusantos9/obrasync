import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity,AccessibleTextInput,AccessibleTextInput as TextInput} from '../accessibility/AccessibleNative';

import styled from 'styled-components/native';

const Wrapper = styled(AccessibleView)`height: 54px; margin-top: -10px; border-radius: 18px; padding: 0 16px; background-color: white; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border}; elevation: 4; shadow-color: #163A5F; shadow-opacity: .08; shadow-radius: 12px;`;
const Input = styled(AccessibleTextInput)`flex: 1; margin-left: 10px; font-size: 16px; color: ${({ theme }) => theme.colors.text};`;
const Filter = styled(AccessibleTouchableOpacity)`width: 36px; height: 36px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.primarySoft}; align-items: center; justify-content: center;`;

export function SearchBar({ value, onChangeText, placeholder = 'O que você precisa?' }) {
  return <Wrapper><Ionicons name="search" size={23} color="#756D7A" /><Input value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#968E99" /><Filter><Ionicons name="options" size={20} color="#1F6AA5" /></Filter></Wrapper>;
}
