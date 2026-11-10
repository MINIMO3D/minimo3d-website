import * as migration_20261110_195947_initial from './20261110_195947_initial';

export const migrations = [
  {
    up: migration_20261110_195947_initial.up,
    down: migration_20261110_195947_initial.down,
    name: '20261110_195947_initial'
  },
];
