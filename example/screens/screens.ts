import {PlaylistScreen} from './Playlist';
import {RandomListScreen} from './RandomList';
import {ReadmeScreen} from './Readme';

const screens = [
  {
    id: '0',
    name: 'Playlist',
    component: PlaylistScreen,
  },
  {
    id: '1',
    name: 'Random List',
    component: RandomListScreen,
  },
  {
    id: '2',
    name: 'Readme',
    component: ReadmeScreen,
  },
];

export default screens;
