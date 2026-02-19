import { useContext as useReactContext } from 'react';
export const useContext = context => {
  const value = useReactContext(context);
  if (value !== undefined) {
    return value;
  }
  throw 'Please consume ReorderableList context within its provider.';
};
//# sourceMappingURL=useContext.js.map