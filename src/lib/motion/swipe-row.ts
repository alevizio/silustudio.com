/*
 * A row of photos that a phone swipes through sideways (work-photos.svelte). This module tells
 * which photo the visitor is looking at, and keeps the row as tall as that photo, so what comes
 * under the row always sits right under the photo in view.
 *
 * That height is the one measure on the site set from a script: it is the size of a photo on
 * this very screen, which no token can know.
 *
 * The row only swipes where its styles make it scroll sideways. Where the photos are stacked
 * instead, they are all in view: the row is left alone and the first photo is the one reported.
 */

const SIDEWAYS_KEYS = ['ArrowLeft', 'ArrowRight'];

/** The middle of an element, across the screen. */
const middle = (element: Element): number => {
	const { left, width } = element.getBoundingClientRect();
	return left + width / 2;
};

/**
 * Follows the row's photos (its `img` elements). `report` is told which photo is in view,
 * counting from 0, and whether the row swipes, at once and then whenever either changes.
 * Returns a function that stops following.
 */
export const followSwipe = (
	row: HTMLElement,
	report: (inView: number, swipes: boolean) => void
): (() => void) => {
	const photos = [...row.querySelectorAll('img')];
	let swipes = false;

	const settle = (): void => {
		swipes = getComputedStyle(row).overflowX !== 'visible';
		// The middle of the row is measured once, not again for every photo.
		const centre = middle(row);
		const distances = photos.map((photo) => Math.abs(middle(photo) - centre));
		const inView = swipes ? Math.max(0, distances.indexOf(Math.min(...distances))) : 0;
		const photo = photos.at(inView);
		row.style.height = swipes && photo ? `${photo.offsetHeight}px` : '';
		report(inView, swipes);
	};

	// While the row swipes, the arrow keys move through its photos and go no further: on a
	// work's page they would otherwise also walk on to the next work.
	const keepSidewaysKeys = (event: KeyboardEvent): void => {
		if (swipes && SIDEWAYS_KEYS.includes(event.key)) event.stopPropagation();
	};

	// The photos change size, and the row starts or stops swiping, only when the screen does.
	window.addEventListener('resize', settle);
	row.addEventListener('scroll', settle, { passive: true });
	row.addEventListener('keydown', keepSidewaysKeys);
	settle();

	return () => {
		window.removeEventListener('resize', settle);
		row.removeEventListener('scroll', settle);
		row.removeEventListener('keydown', keepSidewaysKeys);
	};
};
