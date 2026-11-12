/** How much of an element has to be on screen for it to count as in view. */
const ENOUGH = 0.4;

/**
 * Tells `report` whether enough of `element` is on screen: once at the start, and again each
 * time that changes. Returns a function that stops watching.
 */
export const watchInView = (element: Element, report: (inView: boolean) => void): (() => void) => {
	const watcher = new IntersectionObserver(
		// Several changes can arrive together. Only the latest one is how things stand.
		(entries) => report(entries.at(-1)?.isIntersecting ?? false),
		{ threshold: ENOUGH }
	);
	watcher.observe(element);
	return () => watcher.disconnect();
};
