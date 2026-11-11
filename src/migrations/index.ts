import * as migration_20261110_195947_initial from './20261110_195947_initial';
import * as migration_20261111_170645_homepage_images from './20261111_170645_homepage_images';
import * as migration_20261111_185056_hero_video from './20261111_185056_hero_video';
import * as migration_20261111_192748_calculator from './20261111_192748_calculator';
import * as migration_20261111_200000_material_ratings from './20261111_200000_material_ratings';
import * as migration_20261111_200611_owner_photo from './20261111_200611_owner_photo';

import * as migration_20261111_201000_social_links from './20261111_201000_social_links';

export const migrations = [
  {
    up: migration_20261110_195947_initial.up,
    down: migration_20261110_195947_initial.down,
    name: '20261110_195947_initial',
  },
  {
    up: migration_20261111_170645_homepage_images.up,
    down: migration_20261111_170645_homepage_images.down,
    name: '20261111_170645_homepage_images',
  },
  {
    up: migration_20261111_185056_hero_video.up,
    down: migration_20261111_185056_hero_video.down,
    name: '20261111_185056_hero_video',
  },
  {
    up: migration_20261111_192748_calculator.up,
    down: migration_20261111_192748_calculator.down,
    name: '20261111_192748_calculator',
  },
  {
    up: migration_20261111_200000_material_ratings.up,
    down: migration_20261111_200000_material_ratings.down,
    name: '20261111_200000_material_ratings',
  },
  {
    up: migration_20261111_200611_owner_photo.up,
    down: migration_20261111_200611_owner_photo.down,
    name: '20261111_200611_owner_photo'
  },
  {
    up: migration_20261111_201000_social_links.up,
    down: migration_20261111_201000_social_links.down,
    name: '20261111_201000_social_links',
  },
];
