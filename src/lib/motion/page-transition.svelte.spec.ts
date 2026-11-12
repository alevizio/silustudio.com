import type { OnNavigate } from '$app/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { transitionPages, walkTowards } from './page-transition.ts';
import { transit } from './transit.svelte.ts';

const root = document.documentElement;

/** A navigation from one path to another that completes when `finish` is called. */
const navigation = (from: string, to: string): { event: OnNavigate; finish: () => void } => {
	let finish = () => {};
	const complete = new Promise<void>((resolve) => {
		finish = resolve;
	});
	const target = (pathname: string) => ({
		params: {},
		route: { id: null },
		url: new URL(pathname, location.origin),
		scroll: { x: 0, y: 0 }
	});
	const event: OnNavigate = {
		type: 'goto',
		shallow: false,
		from: target(from),
		to: target(to),
		willUnload: false,
		complete
	};
	return { event, finish: () => finish() };
};

/** Makes the page believe the visitor has, or has not, asked their device for less motion. */
const lessMotion = (asked: boolean): void => {
	const ask = window.matchMedia.bind(window);
	vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
		query.includes('prefers-reduced-motion') ? ask(asked ? 'all' : 'not all') : ask(query)
	);
};

afterEach(() => {
	vi.restoreAllMocks();
	delete root.dataset.walk;
	delete root.dataset.leaving;
	transit.slug = null;
	transit.carries = false;
});

describe('walkTowards', () => {
	it('says which way the walk goes, and that the photo on screen is leaving', () => {
		lessMotion(false);
		const arrived = walkTowards('next');
		expect(root.dataset.walk).toBe('next');
		expect(root.dataset.leaving).toBe('');
		// Once the new page is in place, its photo is the one arriving.
		arrived?.();
		expect(root.dataset.leaving).toBeUndefined();
		expect(root.dataset.walk).toBe('next');
	});

	it('walks back the other way', () => {
		lessMotion(false);
		walkTowards('previous');
		expect(root.dataset.walk).toBe('previous');
	});

	it('does nothing for a visitor who asks for less motion', () => {
		lessMotion(true);
		expect(walkTowards('next')).toBeUndefined();
		expect(root.dataset.walk).toBeUndefined();
		expect(root.dataset.leaving).toBeUndefined();
	});
});

describe('transitionPages', () => {
	it('leaves the navigation alone for a visitor who asks for less motion', () => {
		lessMotion(true);
		const { event } = navigation('/obras/', '/obras/guijarro/');
		expect(transitionPages(event)).toBeUndefined();
		expect(transit.carries).toBe(false);
		expect(transit.slug).toBeNull();
	});

	it('marks the work being opened, so its photo on the wall can travel', async () => {
		lessMotion(false);
		const { event, finish } = navigation('/obras/', '/obras/guijarro/');
		const pictured = transitionPages(event);
		expect(transit.slug).toBe('guijarro');
		expect(transit.carries).toBe(true);
		// The navigation is held until the old page has been pictured, and no longer.
		await pictured;
		finish();
	});

	it('marks the work being left, so its photo can fly back to the wall', async () => {
		lessMotion(false);
		const { event, finish } = navigation('/en/works/cause/', '/en/works/');
		const pictured = transitionPages(event);
		expect(transit.slug).toBe('cause');
		await pictured;
		finish();
	});

	it('marks no work when neither page is a work', async () => {
		lessMotion(false);
		const { event, finish } = navigation('/', '/estudio/');
		const pictured = transitionPages(event);
		expect(transit.slug).toBeNull();
		await pictured;
		finish();
	});

	it('clears the mark and the direction of a walk once the change is over', async () => {
		lessMotion(false);
		const { event, finish } = navigation('/obras/guijarro/', '/obras/cause/');
		root.dataset.walk = 'next';
		const pictured = transitionPages(event);
		await pictured;
		finish();
		await vi.waitFor(() => expect(root.dataset.walk).toBeUndefined());
		expect(transit.slug).toBeNull();
	});
});
