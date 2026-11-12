/*
 * What the components need to know about the page transition (see page-transition.ts).
 */
interface Transit {
	/**
	 * The work whose photo is travelling between a wall of works and the work's own page, by
	 * slug. The wall marks that work's photo, so the browser can fly it across.
	 */
	slug: string | null;
	/**
	 * True once pages change with a transition. The photo that opens a work's page is then
	 * brought in by the transition, and no longer arrives by itself.
	 */
	carries: boolean;
}

export const transit: Transit = $state({ slug: null, carries: false });
