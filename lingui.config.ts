import {defineConfig} from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en',
  /*
   * Translations for our rebranded strings lag behind the source language, and
   * without a fallback Lingui renders the raw message ID (e.g. "bhV8Pa") in the
   * UI. Fall back to English instead.
   */
  fallbackLocales: {default: 'en'},
  locales: [
    'en',
    'an',
    'ast',
    'ca',
    'cs',
    'cy',
    'da',
    'de',
    'el',
    'en-GB',
    'en-CA',
    'eo',
    'es',
    'eu',
    'fi',
    'fr',
    'fr-CA',
    'fy',
    'ga',
    'gd',
    'gl',
    'hi',
    'hu',
    'ia',
    'id',
    'it',
    'ja',
    'km',
    'ko',
    'ne',
    'nl',
    'pl',
    'pt-BR',
    'pt-PT',
    'ro',
    'ru',
    'sv',
    'th',
    'tr',
    'uk',
    'vi',
    'zh-CN',
    'zh-HK',
    'zh-TW',
  ],
  catalogs: [
    {
      path: '<rootDir>/src/locale/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  compileNamespace: 'ts',
})
