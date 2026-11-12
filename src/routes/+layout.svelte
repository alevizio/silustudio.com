<script lang="ts">
	import './layout.css';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/site-footer.svelte';
	import SiteHeader from '#lib/components/site-header.svelte';
	import VisitBand from '#lib/components/visit-band.svelte';
	import WallLight from '#lib/components/wall-light.svelte';
	import { transitionPages } from '#lib/motion/page-transition.ts';
	import { watchReveals } from '#lib/motion/reveal.ts';
	import { copyFor, langFromPath, pageFromPath } from '#lib/i18n/index.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const MAIN_ID = 'contenido';

	const pathname = $derived(page.url.pathname);
	const lang = $derived(langFromPath(pathname));
	const current = $derived(pageFromPath(pathname));

	// The server sets <html lang> for the first page. Moving between languages without a
	// full page load has to update it here, or screen readers keep the old pronunciation.
	$effect(() => {
		document.documentElement.lang = lang;
	});

	// One page gives way to the next, and a work's photo travels between the wall and its page.
	onNavigate(transitionPages);

	// Each page brings its own content, so what should arrive on scroll is looked up again.
	let stopWatching = () => {};
	afterNavigate(() => {
		stopWatching();
		stopWatching = watchReveals();
	});
</script>

<a
	href={`#${MAIN_ID}`}
	class="sr-only bg-ink px-4 py-3 text-label text-wall uppercase focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
>
	{copyFor(lang).nav.skip}
</a>

<WallLight />

<SiteHeader {lang} {current} {pathname} />

<main id={MAIN_ID}>
	{@render children()}
</main>

{#if current !== 'visit'}
	<VisitBand {lang} />
{/if}

<SiteFooter {lang} />
