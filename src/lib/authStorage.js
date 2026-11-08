import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {createSecureSessionStorage} from '../utils/secureSessionStorage';
export const authStorage=Platform.OS==='web'?AsyncStorage:createSecureSessionStorage(SecureStore,AsyncStorage);
