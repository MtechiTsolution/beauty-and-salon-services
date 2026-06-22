import { landingHeroSlides } from '@/features/welcome/lib/landing-content';
import { optimizeImageUrl } from '@mit-salon/shared/lib/salon-image-pool';
import { useEffect } from 'react';

const LANDING_PRELOAD_WIDTH = 720;
const preloaded = new Set<string>();

export function preloadLandingImages(urls: string[]) {
  for (const url of urls) {
    const trimmed = url?.trim();
    if (!trimmed || preloaded.has(trimmed)) continue;
    const optimized = optimizeImageUrl(trimmed, LANDING_PRELOAD_WIDTH);
    preloaded.add(trimmed);
    preloaded.add(optimized);
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'low';
    img.src = optimized;
  }
}

export function useLandingImagePreload(urls: string[]) {
  useEffect(() => {
    preloadLandingImages(urls);
  }, [urls]);
}

export function useLandingHeroPreload() {
  useLandingImagePreload(landingHeroSlides.map((slide) => slide.image));
}

// Warm hero slides as soon as this module loads (before React paints).
preloadLandingImages(landingHeroSlides.map((slide) => slide.image));
