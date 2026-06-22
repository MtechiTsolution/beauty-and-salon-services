/**
 * Everyday, local-salon photos — relatable shop moments, not luxury studio shoots.
 * Used for app logo, favicon, and login/welcome hero panels.
 */
export const CASUAL_SALON_IMAGES = {
  /** Haircut in progress — friendly neighborhood salon vibe */
  logo: '1562322140-8baeececf3df',
  /** Small salon interior with chairs and mirrors */
  hero: '1595476108010-b4d1f102b1b1',
} as const;

function casualCrop(slug: string, width: number, height = width) {
  return `https://images.unsplash.com/photo-${slug}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
}

/** Square brand mark for navbar, sidebar, and login */
export const APP_LOGO_IMAGE = casualCrop(CASUAL_SALON_IMAGES.logo, 128);

export const APP_LOGO_IMAGE_LARGE = casualCrop(CASUAL_SALON_IMAGES.logo, 256);

/** Wide panel for sign-in and welcome screens */
export const APP_HERO_IMAGE = casualCrop(CASUAL_SALON_IMAGES.hero, 1920, 1080);

/** Browser tab icon — same casual haircut photo, small crop */
export const APP_FAVICON_URL = casualCrop(CASUAL_SALON_IMAGES.logo, 64);
