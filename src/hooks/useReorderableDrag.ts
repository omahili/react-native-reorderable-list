import {useContext} from './useContext';
import {ReorderableCellContext} from '../contexts';

export const useReorderableDrag = () => {
  const {dragHandler} = useContext(ReorderableCellContext);
  return dragHandler;
};
