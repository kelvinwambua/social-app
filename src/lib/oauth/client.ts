import {type OAuthClient, type OAuthInitResult} from './types'

/**
 * Native placeholder. OAuth is currently web-only - iOS and Android keep using
 * password auth - so the bundler resolves this file and every entry point stays
 * type-safe without platform branching at the call sites.
 *
 * When we adopt `@atproto/oauth-client-expo`, this is the file to fill in.
 */
export const isOAuthSupported = false

export function getOAuthClient(): Promise<OAuthClient | null> {
  return Promise.resolve(null)
}

export function initOAuth(): Promise<OAuthInitResult> {
  return Promise.resolve(undefined)
}

export function startOAuthSignIn(_options?: {handle?: string}): Promise<void> {
  return Promise.reject(new Error('OAuth is not supported on this platform'))
}

export function restoreOAuthSession(_did: string) {
  return Promise.resolve(null)
}

export function revokeOAuthSession(_did: string) {
  return Promise.resolve()
}
