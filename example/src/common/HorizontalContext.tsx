import React, {Dispatch, SetStateAction, createContext, useState} from 'react';

export const HorizontalContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);

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
