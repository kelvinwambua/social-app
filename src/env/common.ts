import {type Did} from '@atproto/api'

import packageJson from '#/../package.json'

/**
 * The semver version of the app, as defined in `package.json.`
 *
 * N.B. The fallback is needed for Render.com deployments
 */
export const RELEASE_VERSION: string =
  process.env.EXPO_PUBLIC_RELEASE_VERSION || packageJson.version

/**
 * The env the app is running in e.g. development, testflight, production, e2e
 */
export const ENV: string = process.env.EXPO_PUBLIC_ENV as
  | 'production'
  | 'testflight'
  | 'development'
  | 'e2e'
  | (string & {})

/**
 * Indicates whether the app is running in TestFlight
 */
export const IS_TESTFLIGHT = ENV === 'testflight'

/**
 * Indicates whether the app is `__DEV__`
 */
export const IS_DEV = __DEV__

/**
 * Indicates whether the app is running in a test environment
 */
export const IS_E2E = ENV === 'e2e'

/**
 * Indicates whether the app is `__DEV__` or TestFlight
 */
export const IS_INTERNAL = IS_DEV || IS_TESTFLIGHT

/**
 * The commit hash that the current bundle was made from. The user can
 * see the commit hash in the app's settings along with the other version info.
 * Useful for debugging/reporting.
 */
export const BUNDLE_IDENTIFIER: string =
  process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER || 'dev'

/**
 * This will always be in the format of YYMMDDHH, so that it always increases
 * for each build. This should only be used for analytics reporting and shouldn't
 * be used to identify a specific bundle.
 */
export const BUNDLE_DATE: number =
  process.env.EXPO_PUBLIC_BUNDLE_DATE === undefined
    ? 0
    : Number(process.env.EXPO_PUBLIC_BUNDLE_DATE)

/**
 * The log level for the app.
 */
export const LOG_LEVEL = (process.env.EXPO_PUBLIC_LOG_LEVEL || 'info') as
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'

/**
 * Enable debug logs for specific logger instances
 */
export const LOG_DEBUG: string = process.env.EXPO_PUBLIC_LOG_DEBUG || ''

/**
 * The DID of the Bluesky appview to proxy to
 */
export const BLUESKY_PROXY_DID: Did =
  process.env.EXPO_PUBLIC_BLUESKY_PROXY_DID || 'did:web:api.bsky.app'

/**
 * The DID of the chat service to proxy to
 */
export const CHAT_PROXY_DID: Did =
  process.env.EXPO_PUBLIC_CHAT_PROXY_DID || 'did:web:api.bsky.chat'

/**
 * Metrics API host
 */
export const METRICS_API_HOST: string =
  process.env.EXPO_PUBLIC_METRICS_API_HOST || 'https://events.bsky.app'

/**
 * Growthbook API host
 */
export const GROWTHBOOK_API_HOST: string =
  process.env.EXPO_PUBLIC_GROWTHBOOK_API_HOST || `${METRICS_API_HOST}/gb`

/**
 * Growthbook client key
 */
export const GROWTHBOOK_CLIENT_KEY: string =
  process.env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY || 'sdk-7gkUkGy9wguUjyFe'

/**
 * Sentry DSN for telemetry
 */
export const SENTRY_DSN: string | undefined = process.env.EXPO_PUBLIC_SENTRY_DSN

/**
 * Bitdrift API key. If undefined, Bitdrift should be disabled.
 */
export const BITDRIFT_API_KEY: string | undefined =
  process.env.EXPO_PUBLIC_BITDRIFT_API_KEY

/**
 * GCP project ID which is required for native device attestation. On web, this
 * should be unset and evaluate to 0.
 */
export const GCP_PROJECT_ID: number =
  process.env.EXPO_PUBLIC_GCP_PROJECT_ID === undefined
    ? 0
    : Number(process.env.EXPO_PUBLIC_GCP_PROJECT_ID)

/**
 * URLs for the app config web worker. Can be a
 * locally running server, see `env.example` for more.
 */
export const GEOLOCATION_DEV_URL = process.env.GEOLOCATION_DEV_URL
export const GEOLOCATION_PROD_URL = `https://ip.bsky.app`
export const GEOLOCATION_URL = IS_DEV
  ? (GEOLOCATION_DEV_URL ?? GEOLOCATION_PROD_URL)
  : GEOLOCATION_PROD_URL

/**
 * URLs for the live-event config web worker. Can be a
 * locally running server, see `env.example` for more.
 */
export const LIVE_EVENTS_DEV_URL = process.env.LIVE_EVENTS_DEV_URL
export const LIVE_EVENTS_PROD_URL = `https://live-events.workers.bsky.app`
export const LIVE_EVENTS_URL = IS_DEV
  ? (LIVE_EVENTS_DEV_URL ?? LIVE_EVENTS_PROD_URL)
  : LIVE_EVENTS_PROD_URL

/**
 * URLs for the app-config web worker. Can be a
 * locally running server, see `env.example` for more.
 */
export const APP_CONFIG_DEV_URL = process.env.APP_CONFIG_DEV_URL
export const APP_CONFIG_PROD_URL = `https://app-config.workers.bsky.app`
export const APP_CONFIG_URL = IS_DEV
  ? (APP_CONFIG_DEV_URL ?? APP_CONFIG_PROD_URL)
  : APP_CONFIG_PROD_URL

/**
 * Origin that serves the web app and, with it, the atproto OAuth client
 * metadata document. The `client_id` *is* a URL, and the authorization server
 * fetches it, so this must be a public HTTPS origin we control and must match
 * the origin the app is actually served from.
 *
 * Leave unset for local development: atproto treats `http://localhost` as a
 * special "development" client and skips the metadata fetch.
 */
export const OAUTH_CLIENT_ORIGIN: string | undefined =
  process.env.EXPO_PUBLIC_OAUTH_CLIENT_ORIGIN

/**
 * Scopes we request. `atproto` is mandatory; `transition:generic` grants the
 * broad repo access this app needs, and `transition:chat.bsky` covers DMs.
 */
export const OAUTH_SCOPE = 'atproto transition:generic transition:chat.bsky'

/**
 * Resolves the origin to use for OAuth.
 *
 * Prefers the configured value, but falls back to the origin the page is
 * actually served from. That fallback is what lets tunnels (ngrok) and preview
 * deployments work without a rebuild, since `client_id` is only ever read at
 * runtime. Loopback origins are excluded: they are not publicly fetchable, so
 * they have to use the dedicated development client instead.
 */
function resolveOAuthOrigin(): string | undefined {
  if (OAUTH_CLIENT_ORIGIN) return OAUTH_CLIENT_ORIGIN
  const origin =
    typeof window !== 'undefined' ? window.location?.origin : undefined
  if (
    origin &&
    !origin.startsWith('http://localhost') &&
    !origin.startsWith('http://127.0.0.1')
  ) {
    return origin
  }
  return undefined
}

/**
 * Where the authorization server sends people back to. Registered in the
 * client metadata, so it has to line up exactly with what we serve there.
 */
export function getOAuthRedirectUri(): string {
  return `${resolveOAuthOrigin() ?? 'http://localhost:19006'}/oauth/callback`
}

/**
 * The OAuth `client_id`. For localhost we use the documented development form,
 * which encodes redirect/scope in the query string instead of requiring a
 * hosted document.
 */
export function getOAuthClientId(): string {
  const origin = resolveOAuthOrigin()
  if (!origin) {
    const params = new URLSearchParams({
      redirect_uri: getOAuthRedirectUri(),
      scope: OAUTH_SCOPE,
    })
    return `http://localhost?${params.toString()}`
  }
  return `${origin}/client-metadata.json`
}
