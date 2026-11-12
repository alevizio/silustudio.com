/** True when the visitor has asked their device for less motion. */
export const asksForLessMotion = (): boolean =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;
