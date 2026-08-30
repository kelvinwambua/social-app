import type {BrowserOAuthClient} from '@atproto/oauth-client-browser'

import {BSKY_SERVICE, PUBLIC_BSKY_SERVICE} from '#/lib/constants'
import {logger} from '#/logger'
import {getOAuthClientId, OAUTH_SCOPE} from '#/env'

export const isOAuthSupported = true

/*
 * Snapshot the callback params synchronously, at module load.
 *
 * The authorization server redirects to /oauth/callback, which is not a route
 * in the app's router. React Navigation renders "not found" and rewrites the
 * URL, which would strip `code`/`state` before the OAuth client (loaded async,
 * over the network) ever gets to read them. So we take them first and put the
 * URL back to the root ourselves.
 */
const capturedCallbackParams = (() => {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  if (!params.has('code') && !params.has('error')) return null
  window.history.replaceState(null, '', '/')
  return params
})()

let clientPromise: Promise<BrowserOAuthClient> | null = null

/**
 * Lazily builds the shared OAuth client. `load()` fetches our own client
 * metadata document, so this hits the network - keep it off the startup path
 * and call it only when we actually need OAuth.
 */
export async function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (!clientPromise) {
    /*
     * Imported lazily and on demand. Pulling this library in at module scope
     * dragged it (and its WebCrypto/core-js dependencies) onto the app's
     * startup path, where a throw takes down the entire render.
     */
    clientPromise = import('@atproto/oauth-client-browser')
      .then(({BrowserOAuthClient}) =>
        BrowserOAuthClient.load({
          clientId: getOAuthClientId(),
          handleResolver: PUBLIC_BSKY_SERVICE,
          responseMode: 'query',
        }),
      )
      .catch(err => {
        // Let a later attempt rebuild the client rather than caching the failure.
        clientPromise = null
        throw err
      })
  }
  return clientPromise
}

/**
 * Restores a previously authorized session, or completes the redirect back from
 * the authorization server when the URL carries OAuth params. Returns undefined
 * when there is neither.
 */
let initPromise: ReturnType<typeof runInit> | null = null

async function runInit() {
  const client = await getOAuthClient()
  if (capturedCallbackParams) {
    // Redirect URI is omitted deliberately: the client takes it from the
    // metadata document it already loaded.
    return client.initCallback(capturedCallbackParams)
  }
  return client.initRestore()
}

/**
 * Memoized at module scope, deliberately.
 *
 * The authorization state is single-use: whoever redeems it first consumes it,
 * and a second attempt fails with "Unknown authorization session". A component
 * -level guard is not enough, because a remount (which a render-phase crash
 * causes) creates a fresh ref and calls this again. Module scope means once
 * per page load, however many times the component mounts.
 */
export function initOAuth() {
  if (!initPromise) {
    initPromise = runInit()
  }
  return initPromise
}

/**
 * Sends the user to Bluesky to authorize us.
 *
 * Passing the *host* rather than a handle is deliberate and load bearing: the
 * client derives `login_hint` from whatever identity it can resolve out of this
 * input, and only when `login_hint` is absent does the hosted page offer to
 * create an account. That is what lets people sign up without us having to
 * reimplement the captcha gate.
 *
 * @see https://github.com/bluesky-social/atproto/discussions/4125
 */
export async function startOAuthSignIn({handle}: {handle?: string} = {}) {
  const client = await getOAuthClient()
  const input = handle?.trim() || BSKY_SERVICE
  logger.debug('oauth: starting sign in', {hasHandle: Boolean(handle?.trim())})
  await client.signInRedirect(input, {scope: OAUTH_SCOPE})
}

export async function restoreOAuthSession(did: string) {
  const client = await getOAuthClient()
  return client.restore(did)
}

export async function revokeOAuthSession(did: string) {
  const client = await getOAuthClient()
  await client.revoke(did)
}
