import {Image as RNImage, View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {atoms as a, useBreakpoints, useTheme, web} from '#/alf'
import {ArrowOutOfBox_Stroke2_Corner0_Rounded as ArrowOutIcon} from '#/components/icons/ArrowOutOfBox'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'
// @ts-ignore web asset
import badgeNonprofit from '../../assets/images/banner/badge-nonprofit.png'
// @ts-ignore web asset
import badgeOpen from '../../assets/images/banner/badge-open.png'
// @ts-ignore web asset
import bannerBg from '../../assets/images/banner/banner-bg.png'

/**
 * Webpack serves these through `asset/resource`, so the import is already a
 * URL string. Deliberately not `Image.resolveAssetSource`, which exists only
 * on native - calling it here threw at module scope, before React could
 * render, and took the whole app down with it.
 *
 * Written defensively so an unexpected shape degrades to a missing image
 * rather than a blank site.
 */
function assetUri(asset: unknown): string {
  if (typeof asset === 'string') return asset
  if (asset && typeof asset === 'object') {
    const {uri, default: fallback} = asset as {uri?: string; default?: string}
    return uri ?? fallback ?? ''
  }
  return ''
}

const bannerBgUri = assetUri(bannerBg)
const badgeNonprofitUri = assetUri(badgeNonprofit)
const badgeOpenUri = assetUri(badgeOpen)

/**
 * Mirrors the hero card on sparkable.cc. Only rendered for logged-out
 * visitors - once someone has an account it is just noise above their feed.
 */
export function LoggedOutBanner() {
  const t = useTheme()
  const {t: l} = useLingui()
  const {gtMobile} = useBreakpoints()

  return (
    <View style={[a.w_full, a.align_center, a.px_md, {paddingTop: 8}]}>
      <View
        style={[
          a.w_full,
          a.align_center,
          a.border,
          a.overflow_hidden,
          {
            maxWidth: 600,
            borderRadius: 20,
            padding: 16,
            borderColor: 'rgba(39, 41, 55, 0.12)',
            backgroundColor: t.palette.white,
          },
          // The decorative blobs live in the artwork itself, as on the site.
          // These are CSS-only properties, so they go through the web helper.
          web({
            backgroundImage: `url(${bannerBgUri})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            boxShadow: '0px 2px 8px 0px rgba(39, 41, 55, 0.08)',
          }),
        ]}>
        <Text
          style={[
            a.text_center,
            a.font_bold,
            {
              fontSize: gtMobile ? 36 : 26,
              lineHeight: gtMobile ? 40 : 30,
              letterSpacing: -0.8,
              color: 'rgb(39, 41, 55)',
            },
          ]}>
          <Trans>
            We need healthier social media. More urgently than ever.
          </Trans>
        </Text>

        <Text
          style={[
            a.text_center,
            a.pt_sm,
            {
              maxWidth: 450,
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '500',
              color: 'rgba(39, 41, 55, 0.75)',
            },
          ]}>
          <Trans>
            Sparkable is a social media platform designed to bridge divides.
            We're a nonprofit aiming to strengthen democracy and social cohesion
            by rebuilding social media into a force for good.
          </Trans>
        </Text>

        <Link
          to="https://blog.sparkable.cc/about"
          label={l`Learn more about Sparkable`}
          style={[
            a.flex_row,
            a.align_center,
            a.justify_center,
            a.gap_sm,
            {
              marginTop: 16,
              marginBottom: 10,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 30,
              backgroundColor: t.palette.primary_500,
            },
          ]}>
          <Text
            style={[
              a.font_semi_bold,
              {fontSize: 14, lineHeight: 16, color: t.palette.white},
            ]}>
            <Trans>Learn more about Sparkable</Trans>
          </Text>
          <ArrowOutIcon size="xs" fill={t.palette.white} />
        </Link>

        <View style={[a.flex_row, a.align_center, a.justify_center, a.gap_md]}>
          <RNImage
            accessibilityIgnoresInvertColors
            source={{uri: badgeNonprofitUri}}
            style={{width: 90, height: 34, opacity: 0.5}}
            resizeMode="contain"
            accessibilityLabel={l`Independent non-profit organization`}
            accessibilityHint=""
          />
          <RNImage
            accessibilityIgnoresInvertColors
            source={{uri: badgeOpenUri}}
            style={{width: 90, height: 34, opacity: 0.5}}
            resizeMode="contain"
            accessibilityLabel={l`Open and public`}
            accessibilityHint=""
          />
        </View>
      </View>
    </View>
  )
}
