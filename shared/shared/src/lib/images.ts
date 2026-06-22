import { APP_HERO_IMAGE } from './brand';
import { BRANCH_IMAGE_POOL, PACKAGE_IMAGE_POOL, SERVICE_IMAGE_POOL } from './salon-image-pool';

/** Named presets for hero / marketing sections (not used for auto entity assignment). */
export const IMAGES = {
  hero: APP_HERO_IMAGE,
  branches: {
    downtown: BRANCH_IMAGE_POOL[0],
    uptown: BRANCH_IMAGE_POOL[1],
    brooklyn: BRANCH_IMAGE_POOL[2],
    jersey: BRANCH_IMAGE_POOL[3],
    queens: BRANCH_IMAGE_POOL[4],
    westchester: BRANCH_IMAGE_POOL[5],
    hoboken: BRANCH_IMAGE_POOL[6],
    modern: BRANCH_IMAGE_POOL[7],
    luxury: BRANCH_IMAGE_POOL[8],
    boutique: BRANCH_IMAGE_POOL[9],
    loft: BRANCH_IMAGE_POOL[10],
    spa: BRANCH_IMAGE_POOL[11],
  },
  services: {
    haircut: SERVICE_IMAGE_POOL[0],
    color: SERVICE_IMAGE_POOL[1],
    facial: SERVICE_IMAGE_POOL[2],
    nails: SERVICE_IMAGE_POOL[3],
    massage: SERVICE_IMAGE_POOL[4],
    keratin: SERVICE_IMAGE_POOL[5],
    bridal: SERVICE_IMAGE_POOL[6],
    mens: SERVICE_IMAGE_POOL[7],
    blowout: SERVICE_IMAGE_POOL[8],
    pedicure: SERVICE_IMAGE_POOL[9],
  },
  packages: {
    hair: PACKAGE_IMAGE_POOL[0],
    spa: PACKAGE_IMAGE_POOL[1],
    bridal: PACKAGE_IMAGE_POOL[2],
  },
} as const;

export const DEFAULT_SERVICE_IMAGE = SERVICE_IMAGE_POOL[0];
export const DEFAULT_BRANCH_IMAGE = BRANCH_IMAGE_POOL[0];
