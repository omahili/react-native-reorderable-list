import {useCallback, useLayoutEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (...args: any[]) => any;

export const useStableCallback = <T extends Fn>(value: T) => {
  const callback = useRef<T>(value);

  useLayoutEffect(() => {
    callback.current = value;
  });

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return callback.current?.(...args);
  }, []);
};
