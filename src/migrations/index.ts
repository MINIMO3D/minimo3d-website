import * as migration_20261110_195947_initial from './20261110_195947_initial';
import * as migration_20261111_170645_homepage_images from './20261111_170645_homepage_images';

export const migrations = [
  {
    up: migration_20261110_195947_initial.up,
    down: migration_20261110_195947_initial.down,
    name: '20261110_195947_initial',
  },
  {
    up: migration_20261111_170645_homepage_images.up,
    down: migration_20261111_170645_homepage_images.down,
    name: '20261111_170645_homepage_images'
  },
];
