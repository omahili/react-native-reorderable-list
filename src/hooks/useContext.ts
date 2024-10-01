import {useContext as useReactContext} from 'react';

export const useContext = <T>(context: React.Context<T | undefined>) => {
  const value = useReactContext(context);

  if (value !== undefined) {
    return value;
  }

  throw 'Please consume ReorderableList context within its provider.';
};
