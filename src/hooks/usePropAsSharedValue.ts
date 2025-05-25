import {useEffect} from 'react';

import {SharedValue, useSharedValue} from 'react-native-reanimated';

export const usePropAsSharedValue = <T>(value: T): SharedValue<T> => {
  const sv = useSharedValue(value);

  useEffect(() => {
    sv.value = value;
  }, [sv, value]);

  return sv;
};
