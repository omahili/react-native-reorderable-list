import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

export const HorizontalContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);

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

export const HorizontalContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const horizontalState = useState(false);

  return (
    <HorizontalContext.Provider value={horizontalState}>
      {children}
    </HorizontalContext.Provider>
  );
};
