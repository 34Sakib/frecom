'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { EASE_EXP } from './tokens';

/**
 * Single GSAP registration point.
 *
 * CustomEase is registered from the same bezier that CSS and Framer Motion use
 * (`cubic-bezier(0.16, 1, 0.3, 1)`), so a scroll-driven camera move and a hover
 * transition share one acceleration curve. That parity is what makes the site
 * feel like one motion system rather than two libraries with different ideas.
 */
let registered = false;

export function registerGsap(): typeof gsap {
  if (registered || typeof window === 'undefined') return gsap;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // cubic-bezier(0.16, 1, 0.3, 1) as an SVG path.
  CustomEase.create('frecom', 'M0,0 C0.16,1 0.3,1 1,1');
  gsap.defaults({ ease: 'frecom' });
  registered = true;
  return gsap;
}

/** GSAP ease name matching --ease-exp. */
export const EASE = 'frecom';

export { gsap, ScrollTrigger, EASE_EXP };
