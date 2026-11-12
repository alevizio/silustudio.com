<script lang="ts">
	import facade from '#lib/assets/gallery/fachada.jpg?enhanced';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import GalleryMap from '#lib/components/gallery-map.svelte';
	import VisitDetails from '#lib/components/visit-details.svelte';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	const copy = $derived(copyFor(lang).visit);
</script>

<Seo {lang} page="visit" />

<header
	class="mx-auto max-w-page px-gutter pt-6 pb-12 motion-safe:animate-arrive md:pt-12 md:pb-16"
>
	<SectionHeading level={1} label={copy.label} title={copy.pageTitle} />
</header>

<div class="mx-auto max-w-page px-gutter arrive-after-1 motion-safe:animate-arrive">
	<enhanced:img
		src={facade}
		alt={copy.facadeAlt}
		sizes="(min-width: 1280px) 1216px, 100vw"
		fetchpriority="high"
		class="aspect-room size-full object-cover md:aspect-facade"
	/>
</div>

<!--
	The map comes up under the details: its land fades in from its top edge, so that edge can
	sit behind the buttons. The details stay on top, so every link in them can still be pressed.
-->
<section aria-label={copy.pageTitle} class="relative z-10 mx-auto max-w-page px-gutter pt-section">
	<VisitDetails {lang} class="reveal" />
</section>

<!-- The page closes on the map, as wide as the screen. -->
<GalleryMap {lang} class="-mt-6 pb-section md:-mt-24" />
