import {useEffect, useRef} from 'react'

import {initOAuth, isOAuthSupported} from '#/lib/oauth/client'
import {logger} from '#/logger'
import {useSessionApi} from '#/state/session'

/**
 * Completes the OAuth redirect.
 *
 * The authorization server sends people back to `/oauth/callback` carrying the
 * code and state in the query string. `initOAuth` consumes those params (and
 * strips them from the URL), so this has to run once, early, before anything
 * else can navigate and discard them.
 *
 * Renders nothing - it exists purely for the effect.
 */
export function OAuthCallbackHandler() {
  const {loginWithOAuth} = useSessionApi()
  // React 18 double-invokes effects in dev, and the callback params are
  // single-use, so guard against consuming them twice.
  const ranRef = useRef(false)

  useEffect(() => {
    if (!isOAuthSupported || ranRef.current) return
    ranRef.current = true

    void (async () => {
      try {
        const result = await initOAuth()
        if (!result?.session) return
        await loginWithOAuth(result.session, 'OAuth')
      } catch (err) {
        logger.error('oauth: failed to complete authorization', {
          safeMessage: err,
        })
        /*
         * TEMPORARY: surface the failure while we validate the flow against a
         * live authorization server. Without this the error is only visible in
         * devtools, and a silent failure is indistinguishable from "nothing
         * happened". Remove once sign-in is confirmed working.
         */
        const message = err instanceof Error ? err.message : String(err)
        window.alert(`Sparkable OAuth failed:

${message}`)
      }
    })()
  }, [loginWithOAuth])

  return null
}
