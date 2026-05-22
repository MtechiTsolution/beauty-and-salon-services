/** Unsplash placeholder images for mock data (salon / beauty themed) */
export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop',
  branches: {
    downtown: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=500&fit=crop',
    uptown: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb04d?w=800&h=500&fit=crop',
    brooklyn: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a329cf?w=800&h=500&fit=crop',
    jersey: 'https://images.unsplash.com/photo-1487412940907-63eea84c7250?w=800&h=500&fit=crop',
    queens: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
    westchester: 'https://images.unsplash.com/photo-1634449571010-02389ed42f84?w=800&h=500&fit=crop',
    hoboken: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=500&fit=crop',
  },
  services: {
    haircut: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=500&fit=crop',
    color: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop',
    facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop',
    nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=500&fit=crop',
    massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop',
    keratin: 'https://images.unsplash.com/photo-1527799820374-dcf8d9a73791?w=800&h=500&fit=crop',
    bridal: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=500&fit=crop',
    mens: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=500&fit=crop',
    blowout: 'https://images.unsplash.com/photo-1634449571010-02389ed42f84?w=800&h=500&fit=crop',
    pedicure: 'https://images.unsplash.com/photo-1519014816551-74f725a1f9b0?w=800&h=500&fit=crop',
  },
  packages: {
    hair: 'https://images.unsplash.com/photo-1522336572468-97b06e8b9c84?w=800&h=500&fit=crop',
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbbe23?w=800&h=500&fit=crop',
    bridal: 'https://images.unsplash.com/photo-1487412940907-63eea84c7250?w=800&h=500&fit=crop',
  },
} as const;

export const DEFAULT_SERVICE_IMAGE = IMAGES.services.haircut;
export const DEFAULT_BRANCH_IMAGE = IMAGES.branches.downtown;
