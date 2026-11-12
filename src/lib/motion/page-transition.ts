/*
 * Moving between pages. Where the browser can do it, the old page fades away, the new one
 * fades in, and a work's photo travels: from its place on the wall into its own page and back,
 * or sideways from one work to the next, the way one walks along a wall. The motion itself is
 * in layout.css. Visitors who ask for less motion get the new page at once.
 */
import { tick } from 'svelte';
import type { OnNavigate } from '$app/navigation';
import { workSlugFromPath } from '#lib/i18n/index.ts';
import { asksForLessMotion } from './preference.ts';
import { transit } from './transit.svelte.ts';

export type WalkDirection = 'next' | 'previous';

/** The photo that travels: the one opening a work's page, or that work's photo on a wall. */
const TRAVELLING_PHOTO = 'img.travelling-photo';

/** Longest the new page is held back for its travelling photo to load, in milliseconds. */
const PHOTO_WAIT = 400;

let latest: ViewTransition | undefined;

const animatesPages = (): boolean => 'startViewTransition' in document && !asksForLessMotion();

const pause = (milliseconds: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

const onScreen = (element: Element): boolean => {
	const { top, bottom } = element.getBoundingClientRect();
	return bottom > 0 && top < window.innerHeight;
};

/** Holds the new page back until its travelling photo can be shown, but never for long. */
const settle = async (): Promise<void> => {
	const photo = document.querySelector<HTMLImageElement>(TRAVELLING_PHOTO);
	if (!photo) return;
	if (!onScreen(photo)) {
		// The wall opened somewhere else, so the photo has nowhere to fly to and just fades.
		transit.slug = null;
		await tick();
		return;
	}
	// A photo that fails to load simply does not travel.
	if (!photo.complete) await Promise.race([photo.decode().catch(() => {}), pause(PHOTO_WAIT)]);
};

/**
 * Wraps a navigation in a page transition. For the layout's `onNavigate`: the promise it
 * returns holds the navigation until the old page has been pictured.
 */
export const transitionPages = (navigation: OnNavigate): Promise<void> | undefined => {
	if (!animatesPages()) return;

	const from = workSlugFromPath(navigation.from?.url.pathname ?? '');
	const to = workSlugFromPath(navigation.to?.url.pathname ?? '');
	transit.carries = true;
	transit.slug = to ?? from;

	return new Promise((resolve) => {
		const transition = document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
			await settle();
		});
		latest = transition;
		// A change that a newer one cuts short is not an error: the newer one takes over.
		transition.ready.catch(() => {});
		const tidy = (): void => {
			// A newer transition has its own state by now.
			if (latest !== transition) return;
			transit.slug = null;
			delete document.documentElement.dataset.walk;
		};
		transition.finished.then(tidy, tidy);
	});
};

/**
 * Makes the coming transition a walk to the next or the previous work: the photo on screen
 * leaves to one side and the new one comes in from the other. For a work page's `onNavigate`.
 * Returns what to do once the new page is in place.
 */
export const walkTowards = (direction: WalkDirection): (() => void) | undefined => {
	if (!animatesPages()) return;
	const { dataset } = document.documentElement;
	dataset.walk = direction;
	// Until the new page is in place, the photo on screen is the one leaving.
	dataset.leaving = '';
	return () => delete dataset.leaving;
};
