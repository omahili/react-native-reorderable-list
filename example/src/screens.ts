import {ParamListBase} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {ActiveItemScreen} from './ActiveItem';
import {CustomAnimationsScreen} from './CustomAnimations';
import {DragEnableScreen} from './DragEnable';
import {DynamicHeightsScreen} from './DynamicHeights';
import {FloatingHeaderFooterScreen} from './FloatingHeaderFooter';
import {HeaderFooterScreen} from './HeaderFooter';
import {IndexChangeScreen} from './IndexChange';
import {LayoutAnimationsScreen} from './LayoutAnimations';
import {MultipleListsScreen} from './MultipleLists';
import {NestedListsScreen} from './NestedLists';
import {NestedScrollableListsScreen} from './NestedScrollableLists';
import {PlaylistScreen} from './Playlist';
import {ReadmeExampleScreen} from './ReadmeExample';
import {RefreshControlScreen} from './RefreshControl';

const screens = [
  {
    id: '0',
    name: 'Playlist',
    component: PlaylistScreen,
  },
  {
    id: '1',
    name: 'Dynamic Heights',
    component: DynamicHeightsScreen,
  },
  {
    id: '2',
    name: 'Readme Example',
    component: ReadmeExampleScreen,
  },
  {
    id: '3',
    name: 'Header and Footer',
    component: HeaderFooterScreen,
  },
  {
    id: '4',
    name: 'Multiple Lists',
    component: MultipleListsScreen,
  },
  {
    id: '5',
    name: 'Nested Lists',
    component: NestedListsScreen,
  },
  {
    id: '6',
    name: 'Nested Scrollable Lists',
    component: NestedScrollableListsScreen,
  },
  {
    id: '7',
    name: 'Custom Animations',
    component: CustomAnimationsScreen,
  },
  {
    id: '8',
    name: 'Active Item',
    component: ActiveItemScreen,
  },
  {
    id: '9',
    name: 'Refresh Control',
    component: RefreshControlScreen,
  },
  {
    id: '10',
    name: 'Floating Header and Footer',
    component: FloatingHeaderFooterScreen,
  },
  {
    id: '11',
    name: 'Index Change',
    component: IndexChangeScreen,
  },
  {
    id: '12',
    name: 'Layout Animations',
    component: LayoutAnimationsScreen,
  },
  {
    id: '13',
    name: 'Drag Enable',
    component: DragEnableScreen,
  },
] as const;

const names = screens.map(x => x.name);

type Screens = {
  [Key in keyof typeof names]: undefined;
};

interface ScreenParams extends Screens, ParamListBase {}

export type StackNavigationParams = NativeStackNavigationProp<ScreenParams>;
export default screens;
