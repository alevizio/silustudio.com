import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WallLight from './wall-light.svelte';

const layerOf = (container: Element): Element => {
	const layer = container.querySelector('#wall-light');
	if (!layer) throw new Error('The wall light was not rendered');
	return layer;
};

describe('wall-light.svelte', () => {
	it('is decoration: screen readers skip it and nothing in it can take the focus', () => {
		const { container } = render(WallLight);
		const layer = layerOf(container);
		expect(layer.getAttribute('aria-hidden')).toBe('true');
		expect(layer.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0);
		expect(layer.textContent?.trim()).toBe('');
	});

	it('stays fixed behind the page and lets every click through', () => {
		const { container } = render(WallLight);
		const classes = layerOf(container).classList;
		for (const name of ['fixed', 'inset-0', '-z-10', 'pointer-events-none', 'overflow-hidden']) {
			expect(classes.contains(name), name).toBe(true);
		}
	});

	it('draws the shadow of a pergola and of a plant, each blurred and on its own layer', () => {
		const { container } = render(WallLight);
		const layer = layerOf(container);
		expect(layer.querySelectorAll('svg[data-part="slats"] rect').length).toBeGreaterThan(5);
		expect(layer.querySelectorAll('svg[data-part="fronds"] ellipse').length).toBeGreaterThan(2);
		for (const part of layer.querySelectorAll('svg[data-part]')) {
			const blurred = part.querySelector('g[filter]');
			const filter = /url\(#(.+)\)/.exec(blurred?.getAttribute('filter') ?? '')?.[1];
			expect(part.querySelector(`filter#${filter} feGaussianBlur`), filter).not.toBeNull();
		}
	});

	it('tells the styles how many screens the visitor has scrolled', async () => {
		const { container } = render(WallLight);
		const layer = layerOf(container);
		const written = (): number =>
			Number(getComputedStyle(layer).getPropertyValue('--wall-light-screens'));
		expect(written()).toBe(0);
		// The test page is short, so it is made tall enough to scroll one and a half screens.
		const spacer = document.createElement('div');
		spacer.setAttribute('style', `height: ${window.innerHeight * 3}px`);
		document.body.append(spacer);
		window.scrollTo(0, window.innerHeight * 1.5);
		await expect.poll(written).toBe(1.5);
		window.scrollTo(0, 0);
		await expect.poll(written).toBe(0);
		spacer.remove();
	});

	it('steps aside for print and for visitors who ask for more contrast', () => {
		const { container } = render(WallLight);
		const classes = layerOf(container).classList;
		expect(classes.contains('print:hidden')).toBe(true);
		expect(classes.contains('contrast-more:hidden')).toBe(true);
		expect(classes.contains('forced-colors:hidden')).toBe(true);
	});

	it('accepts extra classes', () => {
		const { container } = render(WallLight, { class: 'md:block' });
		expect(layerOf(container).classList.contains('md:block')).toBe(true);
	});
});
