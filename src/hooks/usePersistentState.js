import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export function usePersistentState(key, initialValue, restore = (value) => value) {
  const [value, setValue] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const current = useRef(initialValue);
  const restoreRef = useRef(restore);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!raw || !isMounted) return;
        current.current = restoreRef.current(JSON.parse(raw));
        setValue(current.current);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  const update = async (next) => {
    current.current = typeof next === 'function' ? next(current.current) : next;
    setValue(current.current);
    await AsyncStorage.setItem(key, JSON.stringify(current.current));
    return current.current;
  };

  return [value, update, isHydrated];
}
