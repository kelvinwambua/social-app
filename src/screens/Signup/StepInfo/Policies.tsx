import {type ReactElement} from 'react'
import {View} from 'react-native'
import {type ComAtprotoServerDescribeServer} from '@atproto/api'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'
import {Trans} from '@lingui/react/macro'

import {webLinks} from '#/lib/constants'
import {atoms as a, useTheme} from '#/alf'
import {Admonition} from '#/components/Admonition'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'

export const Policies = ({
  serviceDescription,
}: {
  serviceDescription: ComAtprotoServerDescribeServer.OutputSchema
}) => {
  const t = useTheme()
  const {_} = useLingui()

  if (!serviceDescription) {
    return <View />
  }

  /*
   * Always link to Sparkable's own policies rather than whatever the user's
   * hosting service reports, so the rebranded auth flow stays consistent.
   */
  const tos = webLinks.tos
  const pp = webLinks.privacy

  if (!tos && !pp) {
    return (
      <View style={[a.gap_sm]}>
        <Admonition type="info">
          <Trans>
            This service has not provided terms of service or a privacy policy.
          </Trans>
        </Admonition>
      </View>
    )
  }

  let els: ReactElement<any>
  if (tos && pp) {
    els = (
      <Trans>
        By creating an account you agree to the{' '}
        <InlineLinkText
          label={_(msg`Read the Sparkable Terms of Service`)}
          key="tos"
          to={tos}>
          Terms of Service
        </InlineLinkText>{' '}
        and{' '}
        <InlineLinkText
          label={_(msg`Read the Sparkable Privacy Policy`)}
          key="pp"
          to={pp}>
          Privacy Policy
        </InlineLinkText>
        .
      </Trans>
    )
  } else if (tos) {
    els = (
      <Trans>
        By creating an account you agree to the{' '}
        <InlineLinkText
          label={_(msg`Read the Sparkable Terms of Service`)}
          key="tos"
          to={tos}>
          Terms of Service
        </InlineLinkText>
        .
      </Trans>
    )
  } else if (pp) {
    els = (
      <Trans>
        By creating an account you agree to the{' '}
        <InlineLinkText
          label={_(msg`Read the Sparkable Privacy Policy`)}
          key="pp"
          to={pp}>
          Privacy Policy
        </InlineLinkText>
        .
      </Trans>
    )
  } else {
    return null
  }

  return els ? (
    <Text style={[a.leading_snug, t.atoms.text_contrast_medium]}>{els}</Text>
  ) : null
}
