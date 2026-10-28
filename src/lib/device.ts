/*
 * One device, drawn twice: by CSS (tablet, no WebGL, reduced motion) and in 3D, where it is the
 * iPhone 18 Pro Max model in public/models. Both read these ratios, all as a share of the phone's
 * height, so the live screen lines up pixel for pixel when it moves between them. Measured off the
 * model: 78.0 × 163.35 × 8.7 mm, a 73.0 × 158.5 mm display inset ≈ 2.45 mm all round.
 * globals.css repeats the numbers in `.phone-wrap` / `.phone-rim` / `.phone-bezel` / `.phone-screen`.
 */

export const DEVICE = {
  aspect: 78 / 163.35,
  /** Front glass to back glass (the camera plateau stands proud of this) */
  depth: 8.7 / 163.35,
  /** Outer corner radius (12.8 mm) */
  radius: 12.8 / 163.35,
  /** The metal lip seen from the front, frame edge to cover glass (1.22 mm) */
  rim: 0.00747,
  /** Pure-black border around the display, even all round (1.23 mm) */
  bezel: 0.00753,
};

/** Screen inset from the outer edge (rim + bezel) */
export const SCREEN_INSET_RATIO = DEVICE.rim + DEVICE.bezel;
