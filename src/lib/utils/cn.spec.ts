import { describe, expect, it } from 'vitest';
import { cn } from './cn.ts';

describe('cn', () => {
	it('joins class names and skips falsy values', () => {
		expect(cn('flex', false, undefined, 'gap-3')).toBe('flex gap-3');
	});

	it('lets the last conflicting utility win', () => {
		expect(cn('px-4', 'px-6')).toBe('px-6');
	});

	it('keeps a custom type size next to a text colour', () => {
		expect(cn('text-label', 'text-ink')).toBe('text-label text-ink');
	});

	it('treats the custom type sizes as one group', () => {
		expect(cn('text-title', 'text-display')).toBe('text-display');
	});
});
