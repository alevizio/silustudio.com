import { vi } from 'vitest';

/**
 * For tests: makes the page believe the visitor has asked their device for less motion, until
 * the mocks are restored.
 */
export const askForLessMotion = (): void => {
	vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
		matches: query.includes('prefers-reduced-motion'),
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	}));
};
