import { useCallback, useLayoutEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const useStableCallback = value => {
  const callback = useRef(value);
  useLayoutEffect(() => {
    callback.current = value;
  });
  return useCallback((...args) => {
    var _callback$current;
    return (_callback$current = callback.current) === null || _callback$current === void 0 ? void 0 : _callback$current.call(callback, ...args);
  }, []);
};
//# sourceMappingURL=useStableCallback.js.map