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

	it('draws the shadow of a pergola and of a plant, both blurred', () => {
		const { container } = render(WallLight);
		const layer = layerOf(container);
		expect(layer.querySelectorAll('[data-part="slats"] rect').length).toBeGreaterThan(5);
		expect(layer.querySelectorAll('[data-part="fronds"] ellipse').length).toBeGreaterThan(2);
		for (const part of layer.querySelectorAll('[data-part]')) {
			const filter = /url\(#(.+)\)/.exec(part.getAttribute('filter') ?? '')?.[1];
			expect(layer.querySelector(`filter#${filter} feGaussianBlur`), filter).not.toBeNull();
		}
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
