import {useContext} from 'react';

import {HorizontalContext} from './HorizontalContext';

export const useHorizontal = () => {
  const horizontalState = useContext(HorizontalContext);
  if (!horizontalState) {
    throw new Error('useHorizontal within it HorizontalContextProvider');
  }

  return {
    horizontal: horizontalState[0],
    setHorizontal: horizontalState[1],
  };
};
