import {StyleSheet, Text, type TextProps} from 'react-native'

/**
 * The Sparkable wordmark. Rendered as text in the app font (Inter) rather than
 * as hand-drawn SVG paths, so it stays crisp at any size and is trivial to
 * restyle. The `width` prop is kept for API compatibility with the previous
 * SVG logotype and drives the font size so existing call sites keep working.
 */
export function Logotype({
  fill,
  width,
  style,
  ...rest
}: {fill?: string; width?: number | string} & TextProps) {
  const size = parseInt(String(width ?? 128), 10)

  return (
    <Text
      accessibilityLabel="Sparkable"
      accessibilityHint=""
      style={[
        styles.wordmark,
        {fontSize: size * 0.24, lineHeight: size * 0.28},
        typeof fill === 'string' ? {color: fill} : undefined,
        style,
      ]}
      {...rest}>
      Sparkable
    </Text>
  )
}

const styles = StyleSheet.create({
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
})
