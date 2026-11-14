import { afterEach, describe, expect, it } from 'vitest';
import { followSwipe } from './swipe-row.ts';

/** The row and every photo are this wide, so one photo fills the row. */
const WIDTH = 300;
const TALL = 400;
const SHORT = 150;

type Report = [inView: number, swipes: boolean];

/** A row of photos of these heights that scrolls sideways, or one whose photos simply show. */
const rowOf = (heights: number[], scrolls = true): HTMLElement => {
	const row = document.createElement('div');
	row.style.cssText = `display: flex; align-items: flex-start; width: ${WIDTH}px; overflow: ${scrolls ? 'auto hidden' : 'visible'};`;
	for (const height of heights) {
		const photo = document.createElement('img');
		photo.style.cssText = `flex: none; width: ${WIDTH}px; height: ${height}px;`;
		row.append(photo);
	}
	document.body.append(row);
	return row;
};

/** Follows a row and keeps everything it reports. */
const followed = (row: HTMLElement): { reports: Report[]; stop: () => void } => {
	const reports: Report[] = [];
	const stop = followSwipe(row, (inView, swipes) => reports.push([inView, swipes]));
	return { reports, stop };
};

/** Presses a key on the row and tells whether the window heard it. */
const reachesWindow = (row: HTMLElement, key: string): boolean => {
	let heard = false;
	const hear = (): void => {
		heard = true;
	};
	window.addEventListener('keydown', hear);
	row.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	window.removeEventListener('keydown', hear);
	return heard;
};

describe('swipe-row.ts', () => {
	afterEach(() => document.body.replaceChildren());

	it('starts on the first photo and makes the row as tall as it', () => {
		const row = rowOf([SHORT, TALL, TALL]);
		const { reports, stop } = followed(row);
		expect(reports.at(-1)).toEqual([0, true]);
		expect(row.style.height).toBe(`${SHORT}px`);
		stop();
	});

	it('follows the visitor to the photo swiped to, and the row takes its height', async () => {
		const row = rowOf([TALL, SHORT, TALL]);
		const { reports, stop } = followed(row);
		row.scrollLeft = WIDTH;
		await expect.poll(() => reports.at(-1)).toEqual([1, true]);
		expect(row.style.height).toBe(`${SHORT}px`);

		row.scrollLeft = WIDTH * 2;
		await expect.poll(() => reports.at(-1)).toEqual([2, true]);
		expect(row.style.height).toBe(`${TALL}px`);
		stop();
	});

	it('leaves alone a row whose photos are stacked, and reports the first', () => {
		const row = rowOf([TALL, SHORT], false);
		const { reports, stop } = followed(row);
		expect(reports.at(-1)).toEqual([0, false]);
		expect(row.style.height).toBe('');
		stop();
	});

	it('lets go of the height when the screen grows and the row no longer swipes', () => {
		const row = rowOf([SHORT, TALL]);
		const { reports, stop } = followed(row);
		expect(row.style.height).toBe(`${SHORT}px`);

		row.style.overflow = 'visible';
		window.dispatchEvent(new Event('resize'));
		expect(reports.at(-1)).toEqual([0, false]);
		expect(row.style.height).toBe('');
		stop();
	});

	it('takes the new height of the photo in view when the screen changes size', () => {
		const row = rowOf([TALL, SHORT]);
		const { stop } = followed(row);
		const [first] = row.querySelectorAll('img');
		first.style.height = `${SHORT}px`;
		window.dispatchEvent(new Event('resize'));
		expect(row.style.height).toBe(`${SHORT}px`);
		stop();
	});

	it('keeps the sideways arrow keys to itself while it swipes, and no other key', () => {
		const row = rowOf([TALL, TALL]);
		const { stop } = followed(row);
		expect(reachesWindow(row, 'ArrowRight')).toBe(false);
		expect(reachesWindow(row, 'ArrowLeft')).toBe(false);
		expect(reachesWindow(row, 'Tab')).toBe(true);
		stop();
	});

	it('lets the arrow keys through where the photos are stacked', () => {
		const row = rowOf([TALL, TALL], false);
		const { stop } = followed(row);
		expect(reachesWindow(row, 'ArrowRight')).toBe(true);
		stop();
	});

	it('copes with a row that has no photos', () => {
		const row = rowOf([]);
		const { reports, stop } = followed(row);
		expect(reports.at(-1)).toEqual([0, true]);
		expect(row.style.height).toBe('');
		stop();
	});

	it('does nothing more once it is told to stop', async () => {
		const row = rowOf([TALL, SHORT]);
		const { reports, stop } = followed(row);
		const before = reports.length;
		stop();

		row.scrollLeft = WIDTH;
		// Two frames are more than a scroll needs to be heard.
		await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
		window.dispatchEvent(new Event('resize'));
		expect(reports).toHaveLength(before);
		expect(row.style.height).toBe(`${TALL}px`);
		expect(reachesWindow(row, 'ArrowRight')).toBe(true);
	});
});
