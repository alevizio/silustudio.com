import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ArrowIcon from './arrow-icon.svelte';

describe('arrow-icon.svelte', () => {
	it('draws an arrow that says nothing to screen readers', async () => {
		const { container } = render(ArrowIcon);
		const arrow = container.querySelector('svg');
		expect(arrow?.getAttribute('aria-hidden')).toBe('true');
		expect(arrow?.querySelector('path')).not.toBeNull();
	});

	it('points right unless told to point left', async () => {
		const right = render(ArrowIcon).container.querySelector('svg');
		const left = render(ArrowIcon, { direction: 'left' }).container.querySelector('svg');
		expect(right?.classList.contains('-scale-x-100')).toBe(false);
		expect(left?.classList.contains('-scale-x-100')).toBe(true);
	});

	it('takes the colour of the text around it', async () => {
		const { container } = render(ArrowIcon);
		expect(container.querySelector('svg')?.getAttribute('stroke')).toBe('currentColor');
	});

	it('accepts extra classes', async () => {
		const { container } = render(ArrowIcon, { class: 'text-ink-soft' });
		expect(container.querySelector('svg')?.classList.contains('text-ink-soft')).toBe(true);
	});
});
