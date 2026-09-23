import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export function usePersistentState(key, initialValue, restore = (value) => value) {
  const [value, setValue] = useState(initialValue);
  const current = useRef(initialValue);

  useEffect(() => {
    AsyncStorage.getItem(key).then((raw) => {
      if (!raw) return;
      current.current = restore(JSON.parse(raw));
      setValue(current.current);
    }).catch(() => {});
  }, [key]);

  const update = async (next) => {
    current.current = typeof next === 'function' ? next(current.current) : next;
    setValue(current.current);
    await AsyncStorage.setItem(key, JSON.stringify(current.current));
    return current.current;
  };

  return [value, update];
}
