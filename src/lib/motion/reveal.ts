/*
 * Lets content arrive softly the first time it scrolls into view. An element opts in with the
 * `reveal` class. This module only marks each one as waiting or shown; the look of both states,
 * and the motion between them, is in layout.css.
 *
 * Nothing is hidden unless this script runs, so without scripts the whole page is simply there.
 */

import { asksForLessMotion } from './preference.ts';

const WAITING = 'waiting';
const SHOWN = 'shown';

/** An element counts as arrived once its top edge is this far above the bottom of the screen. */
const ARRIVAL_MARGIN = '0px 0px -8% 0px';

/**
 * Watches every `.reveal` element inside `root`. Those below the screen wait, and are shown as
 * the visitor reaches them. Those on screen or already scrolled past are shown at once, with no
 * motion. Returns a function that stops watching.
 */
export const watchReveals = (root: ParentNode = document): (() => void) => {
	const elements = root.querySelectorAll<HTMLElement>('.reveal');
	if (asksForLessMotion() || !('IntersectionObserver' in window)) {
		for (const element of elements) element.dataset.reveal = SHOWN;
		return () => {};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const { isIntersecting, target } of entries) {
				if (!isIntersecting || !(target instanceof HTMLElement)) continue;
				target.dataset.reveal = SHOWN;
				observer.unobserve(target);
			}
		},
		{ rootMargin: ARRIVAL_MARGIN }
	);

	for (const element of elements) {
		const belowTheScreen = element.getBoundingClientRect().top > window.innerHeight;
		element.dataset.reveal = belowTheScreen ? WAITING : SHOWN;
		if (belowTheScreen) observer.observe(element);
	}

	return () => observer.disconnect();
};
