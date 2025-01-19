import {useContext} from './useContext';
import {ReorderableCellContext} from '../contexts';

export const useIsActive = () => {
  const {isActive} = useContext(ReorderableCellContext);
  return isActive;
};
