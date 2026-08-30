import type {
  BrowserOAuthClient,
  OAuthSession,
} from '@atproto/oauth-client-browser'

export type OAuthClient = BrowserOAuthClient

/**
 * Shape returned when completing a redirect or restoring a stored session.
 * Declared here so the native stub stays structurally compatible with the web
 * implementation - otherwise `undefined` narrows to `never` at the call sites.
 */
export type OAuthInitResult =
  | {session: OAuthSession; state?: string | null}
  | undefined
