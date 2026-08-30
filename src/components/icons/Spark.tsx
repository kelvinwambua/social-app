import {createSinglePathSVG} from './TEMPLATE'

/*
 * The Sparkable mark used as the spark (like) affordance. Same astroid
 * curvature as the brand logo in `src/view/icons/Logo.tsx`, refitted to the
 * 24x24 icon viewBox.
 *
 * The outline variant is a filled ring rather than a stroked path: the tips are
 * cusps, and stroking them would blunt each point to a bevel. Drawing the mark
 * twice - the second one scaled about the centre - and relying on the evenodd
 * fill rule keeps all four tips sharp.
 */
const SPARK_OUTER =
  'M23.5 0.5C16.45 9.03 16.45 14.97 23.5 23.5C14.97 16.45 9.03 16.45 0.5 23.5C7.55 14.97 7.55 9.03 0.5 0.5C9.03 7.55 14.97 7.55 23.5 0.5Z'
const SPARK_INNER =
  'M19.59 4.41C14.94 10.04 14.94 13.96 19.59 19.59C13.96 14.94 10.04 14.94 4.41 19.59C9.06 13.96 9.06 10.04 4.41 4.41C10.04 9.06 13.96 9.06 19.59 4.41Z'

export const Spark_Stroke2_Corner0_Rounded = createSinglePathSVG({
  path: SPARK_OUTER + SPARK_INNER,
})

export const Spark_Filled_Stroke2_Corner0_Rounded = createSinglePathSVG({
  path: SPARK_OUTER,
})
