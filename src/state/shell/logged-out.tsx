import {createContext, useContext, useMemo, useState} from 'react'

import {isOAuthSupported, startOAuthSignIn} from '#/lib/oauth/client'
import {logger} from '#/logger'
import {useSession} from '#/state/session'
import {useActiveLanding} from '#/state/shell/landing'
import {IS_WEB} from '#/env'

type State = {
  showLoggedOut: boolean
  /**
   * Account did used to populate the login form when the logged out view is
   * shown.
   */
  requestedAccountSwitchTo?: string
}

type Controls = {
  /**
   * Show or hide the logged out view.
   */
  setShowLoggedOut: (show: boolean) => void
  /**
   * Shows the logged out view and drops the user into the login form using the
   * requested account.
   */
  requestSwitchToAccount: (props: {
    /**
     * The did of the account to populate the login form with.
     */
    requestedAccount?:
      | (string & {})
      | 'none'
      | 'new'
      | 'starterpack'
      | 'groupchat'
  }) => void
  /**
   * Clears the requested account so that next time the logged out view is
   * show, no account is pre-populated.
   */
  clearRequestedAccount: () => void
}

const StateContext = createContext<State>({
  showLoggedOut: false,
  requestedAccountSwitchTo: undefined,
})
StateContext.displayName = 'LoggedOutStateContext'

const ControlsContext = createContext<Controls>({
  setShowLoggedOut: () => {},
  requestSwitchToAccount: () => {},
  clearRequestedAccount: () => {},
})
ControlsContext.displayName = 'LoggedOutControlsContext'

function getRequestedAccountFromLanding(
  landing: ReturnType<typeof useActiveLanding>,
  hasSession: boolean,
): string | undefined {
  if (hasSession || !landing) return undefined

  switch (landing.type) {
    case 'starterpack':
      return IS_WEB ? 'starterpack' : 'new'
    case 'groupchat':
      return 'groupchat'
    default:
      return undefined
  }
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  const activeLanding = useActiveLanding()
  const {hasSession} = useSession()

  const requestedAccount = getRequestedAccountFromLanding(
    activeLanding,
    hasSession,
  )

  const [state, setState] = useState<State>({
    showLoggedOut: Boolean(requestedAccount),
    requestedAccountSwitchTo: requestedAccount,
  })

  const controls = useMemo<Controls>(
    () => ({
      setShowLoggedOut(show) {
        setState(s => ({
          ...s,
          showLoggedOut: show,
        }))
      },
      requestSwitchToAccount({requestedAccount}) {
        const showLoggedOutView = () =>
          setState(s => ({
            ...s,
            showLoggedOut: true,
            requestedAccountSwitchTo: requestedAccount,
          }))

        /*
         * Sign-up goes through Bluesky's hosted OAuth page, which runs the
         * captcha we cannot implement ourselves. Every "create account" entry
         * point funnels through here, so intercepting once covers all of them.
         *
         * Falls back to the in-app flow when OAuth is unsupported (native) or
         * fails to start.
         */
        if (requestedAccount === 'new' && isOAuthSupported) {
          startOAuthSignIn().catch(err => {
            logger.error('oauth: failed to start sign up', {safeMessage: err})
            showLoggedOutView()
          })
          return
        }

        showLoggedOutView()
      },
      clearRequestedAccount() {
        setState(s => ({
          ...s,
          requestedAccountSwitchTo: undefined,
        }))
      },
    }),
    [setState],
  )

  return (
    <StateContext.Provider value={state}>
      <ControlsContext.Provider value={controls}>
        {children}
      </ControlsContext.Provider>
    </StateContext.Provider>
  )
}

export function useLoggedOutView() {
  return useContext(StateContext)
}

export function useLoggedOutViewControls() {
  return useContext(ControlsContext)
}
