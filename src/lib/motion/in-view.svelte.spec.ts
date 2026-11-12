import { afterEach, describe, expect, it } from 'vitest';
import { watchInView } from './in-view.ts';

/** A box of this many pixels, and a spacer tall enough to push it off any test screen. */
const BOX = 200;
const FAR = 5000;

const block = (height: number): HTMLElement => {
	const element = document.createElement('div');
	element.style.height = `${height}px`;
	return element;
};

describe('in-view.ts', () => {
	afterEach(() => document.body.replaceChildren());

	it('reports an element on screen, and again when it is pushed out of sight and comes back', async () => {
		const box = block(BOX);
		document.body.append(box);
		const reports: boolean[] = [];
		const stop = watchInView(box, (inView) => reports.push(inView));
		await expect.poll(() => reports).toEqual([true]);

		const spacer = block(FAR);
		box.before(spacer);
		await expect.poll(() => reports).toEqual([true, false]);

		spacer.remove();
		await expect.poll(() => reports).toEqual([true, false, true]);
		stop();
	});

	it('says nothing more once it is told to stop', async () => {
		const box = block(BOX);
		document.body.append(box);
		const reports: boolean[] = [];
		const stop = watchInView(box, (inView) => reports.push(inView));
		await expect.poll(() => reports).toEqual([true]);
		stop();

		box.before(block(FAR));
		// Two frames are more than the watcher needs to notice a change.
		await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
		expect(reports).toEqual([true]);
	});
});
