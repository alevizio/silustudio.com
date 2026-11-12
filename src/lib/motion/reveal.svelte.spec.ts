import { afterEach, describe, expect, it } from 'vitest';
import { watchReveals } from './reveal.ts';

/*
 * A page two screens tall with one `.reveal` block on the first screen and one far below it.
 * The test page has no style sheet, so the blocks are placed with plain attributes.
 */
const build = (): { root: HTMLElement; onScreen: HTMLElement; below: HTMLElement } => {
	const root = document.createElement('div');
	root.setAttribute('style', `height: ${window.innerHeight * 3}px; position: relative`);
	const block = (top: number): HTMLElement => {
		const element = document.createElement('p');
		element.className = 'reveal';
		element.textContent = 'Obra';
		element.setAttribute('style', `position: absolute; top: ${top}px; height: 40px; width: 100px`);
		root.append(element);
		return element;
	};
	const onScreen = block(20);
	const below = block(window.innerHeight * 2);
	document.body.append(root);
	return { root, onScreen, below };
};

let page: ReturnType<typeof build> | undefined;
let stop = () => {};

afterEach(() => {
	stop();
	page?.root.remove();
	window.scrollTo(0, 0);
});

describe('watchReveals', () => {
	it('shows what is on screen at once and keeps what is below waiting', () => {
		page = build();
		stop = watchReveals(page.root);
		expect(page.onScreen.dataset.reveal).toBe('shown');
		expect(page.below.dataset.reveal).toBe('waiting');
	});

	it('shows a waiting element when the visitor scrolls to it, and only then', async () => {
		page = build();
		stop = watchReveals(page.root);
		const { below } = page;
		window.scrollTo(0, window.innerHeight * 0.5);
		await new Promise((done) => setTimeout(done, 150));
		expect(below.dataset.reveal).toBe('waiting');
		below.scrollIntoView({ block: 'center' });
		await expect.poll(() => below.dataset.reveal).toBe('shown');
	});

	it('does not hide again what the visitor has already seen', async () => {
		page = build();
		stop = watchReveals(page.root);
		const { below } = page;
		below.scrollIntoView({ block: 'center' });
		await expect.poll(() => below.dataset.reveal).toBe('shown');
		window.scrollTo(0, 0);
		await new Promise((done) => setTimeout(done, 150));
		expect(below.dataset.reveal).toBe('shown');
	});

	it('shows at once what the visitor has already scrolled past', () => {
		page = build();
		window.scrollTo(0, window.innerHeight * 1.5);
		stop = watchReveals(page.root);
		expect(page.onScreen.dataset.reveal).toBe('shown');
	});

	it('stops watching when asked', async () => {
		page = build();
		stop = watchReveals(page.root);
		stop();
		page.below.scrollIntoView({ block: 'center' });
		await new Promise((done) => setTimeout(done, 200));
		expect(page.below.dataset.reveal).toBe('waiting');
	});

	it('leaves elements without the class alone, and copes with a page that has none', () => {
		page = build();
		const plain = document.createElement('p');
		page.root.append(plain);
		stop = watchReveals(page.root);
		expect(plain.dataset.reveal).toBeUndefined();
		const empty = document.createElement('div');
		expect(() => watchReveals(empty)()).not.toThrow();
	});
});
