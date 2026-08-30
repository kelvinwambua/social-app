/*
 * Registers the Inter webfonts used by ALF.
 *
 * The `@font-face` rules live in `web/index.html`, which only the webpack web
 * build consumes. The Metro web bundler serves its own HTML shell, so without
 * this the app silently falls back to system-ui. `loadAsync` resolves the
 * asset URI through the bundler and registers the face with the document.
 */
import * as Font from 'expo-font'

void Font.loadAsync({
  InterVariable: require('../../../assets/fonts/inter/InterVariable.woff2'),
  InterVariableItalic: require('../../../assets/fonts/inter/InterVariable-Italic.woff2'),
}).catch(() => {
  // Non-fatal: text still renders with the fallback stack.
})
