import {useCallback} from 'react'

import {HELP_DESK_URL} from '#/lib/constants'

export enum SupportCode {
  AA_DID = 'AA_DID',
  AA_BIRTHDATE = 'AA_BIRTHDATE',
}

/**
 * Builds a link to the contact page. The support code is passed through as a
 * query param so we can tell from an inbound message which flow the person
 * came from - the page itself ignores anything it doesn't recognize.
 */
export function useCreateSupportLink() {
  return useCallback(({code}: {code: SupportCode; email?: string}) => {
    const url = new URL(HELP_DESK_URL)
    url.search = new URLSearchParams({ref: code}).toString()
    return url.toString()
  }, [])
}
