import {useEffect, useRef} from 'react';
import Animated, {cancelAnimation, makeMutable} from 'react-native-reanimated';

function useAnimatedSharedValues<T>(
  initFunc: (index: number) => T,
  size: number,
  shrink = true,
): Animated.SharedValue<T>[] {
  const ref = useRef<Animated.SharedValue<T>[]>([]);

  if (size !== 0 && ref.current.length === 0) {
    ref.current = [];
    for (let i = 0; i < size; i++) {
      ref.current[i] = makeMutable(initFunc(i));
    }
  }

  useEffect(() => {
    if (size > ref.current.length) {
      for (let i = ref.current.length; i < size; i++) {
        ref.current[i] = makeMutable(initFunc(i));
      }
    } else if (shrink && size < ref.current.length) {
      for (let i = size; i < ref.current.length; i++) {
        cancelAnimation(ref.current[i]);
      }

      ref.current.splice(size, ref.current.length - size);
    }
  }, [size, initFunc, shrink]);

  useEffect(() => {
    return () => {
      for (let i = 0; i < ref.current.length; i++) {
        cancelAnimation(ref.current[i]);
      }
    };
  }, []);

  return ref.current;
}

export default useAnimatedSharedValues;
