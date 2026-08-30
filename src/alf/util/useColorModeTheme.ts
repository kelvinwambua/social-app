import {useLayoutEffect} from 'react'
import {type ColorSchemeName, useColorScheme} from 'react-native'
import {type ThemeName} from '@bsky.app/alf'

import {useThemePrefs} from '#/state/shell'
import {dark, dim, light} from '#/alf/themes'
import {IS_WEB} from '#/env'

export function useColorModeTheme(): ThemeName {
  const theme = useThemeName()

  useLayoutEffect(() => {
    updateDocument(theme)
  }, [theme])

  return theme
}

export function useThemeName(): ThemeName {
  const colorScheme = useColorScheme()
  const {colorMode, darkTheme} = useThemePrefs()

  return getThemeName(colorScheme, colorMode, darkTheme)
}

function getThemeName(
  colorScheme: ColorSchemeName,
  colorMode: 'system' | 'light' | 'dark',
  darkTheme?: ThemeName,
) {
  if (
    (colorMode === 'system' && colorScheme === 'light') ||
    colorMode === 'light'
  ) {
    return 'light'
  } else {
    return darkTheme ?? 'dim'
  }
}

function updateDocument(theme: ThemeName) {
  // @ts-ignore web only
  if (IS_WEB && typeof window !== 'undefined') {
    // @ts-ignore web only
    const html = window.document.documentElement
    // @ts-ignore web only
    const meta = window.document.querySelector('meta[name="theme-color"]')

    // remove any other color mode classes
    html.className = html.className.replace(/(theme)--\w+/g, '')
    html.classList.add(`theme--${theme}`)
    // set color to 'theme-color' meta tag
    meta?.setAttribute('content', getBackgroundColor(theme))
    /*
     * Paint the document itself, not just the React tree. The HTML shell
     * differs per bundler (Metro serves its own template, webpack uses
     * web/index.html), and Metro's template sets no background at all - so
     * without this the area outside the app canvas (overscroll, pre-paint)
     * shows through instead of the theme background.
     */
    const backgroundColor = getBackgroundColor(theme)
    html.style.backgroundColor = backgroundColor
    // @ts-ignore web only
    if (window.document.body) {
      // @ts-ignore web only
      window.document.body.style.backgroundColor = backgroundColor
    }
    window.localStorage.setItem('ALF_THEME', theme)
  }
}

export function getBackgroundColor(theme: ThemeName): string {
  switch (theme) {
    case 'light':
      return light.atoms.bg.backgroundColor
    case 'dark':
      return dark.atoms.bg.backgroundColor
    case 'dim':
      return dim.atoms.bg.backgroundColor
  }
}
