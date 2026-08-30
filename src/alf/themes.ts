import {
  createThemes,
  DEFAULT_PALETTE,
  DEFAULT_SUBDUED_PALETTE,
} from '@bsky.app/alf'

/*
 * Sparkable brand blue scale, replacing Bluesky's #006AFF primary. primary_500
 * is the brand color; the rest of the scale is derived around it so buttons,
 * links, and accents read as one system on a white background with black text.
 */
const SPARKABLE_PRIMARY = {
  primary_25: '#F3F4FE',
  primary_50: '#EAECFE',
  primary_100: '#D6DAFD',
  primary_200: '#B3BAFB',
  primary_300: '#8A94F9',
  primary_400: '#626FF7',
  primary_500: '#4153F5',
  primary_600: '#2F3FE0',
  primary_700: '#2531B8',
  primary_800: '#1F298F',
  primary_900: '#1A2166',
  primary_950: '#131847',
  primary_975: '#0E1133',
}

/*
 * Sparkable secondary accents, used sparingly. Pink drives the spark (like)
 * heart via `palette.pink`/`palette.like`; green is reserved for brand
 * gradients and highlights.
 */
const SPARKABLE_ACCENTS = {
  pink: '#FB7AC3',
  like: '#FB7AC3',
}

const DEFAULT_THEMES = createThemes({
  defaultPalette: {...DEFAULT_PALETTE, ...SPARKABLE_PRIMARY, ...SPARKABLE_ACCENTS},
  subduedPalette: {
    ...DEFAULT_SUBDUED_PALETTE,
    ...SPARKABLE_PRIMARY,
    ...SPARKABLE_ACCENTS,
  },
})

export const themes = {
  lightPalette: DEFAULT_THEMES.light.palette,
  darkPalette: DEFAULT_THEMES.dark.palette,
  dimPalette: DEFAULT_THEMES.dim.palette,
  light: DEFAULT_THEMES.light,
  dark: DEFAULT_THEMES.dark,
  dim: DEFAULT_THEMES.dim,
}

/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const lightPalette = DEFAULT_THEMES.light.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const darkPalette = DEFAULT_THEMES.dark.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const dimPalette = DEFAULT_THEMES.dim.palette
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const light = DEFAULT_THEMES.light
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dark = DEFAULT_THEMES.dark
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dim = DEFAULT_THEMES.dim
