import { useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';
export const usePropAsSharedValue = value => {
  const sv = useSharedValue(value);
  useEffect(() => {
    sv.value = value;
  }, [sv, value]);
  return sv;
};
//# sourceMappingURL=usePropAsSharedValue.js.map