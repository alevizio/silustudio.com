import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The custom type sizes share the `text-` prefix with colours. Telling tailwind-merge
// they are font sizes stops it from dropping `text-ink` when it meets `text-label`.
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [{ text: ['label', 'tag', 'display', 'title', 'lead', 'prose'] }]
		}
	}
});

/** Merges conditional class names and resolves Tailwind conflicts (the last one wins). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
