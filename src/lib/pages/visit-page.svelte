<script lang="ts">
	import facade from '#lib/assets/gallery/fachada.jpg?enhanced';
	import garden from '#lib/assets/gallery/jardin.jpg?enhanced';
	import patio from '#lib/assets/gallery/patio.jpg?enhanced';
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
	const places = $derived([
		{ key: 'patio', picture: patio, alt: copy.placeAlts.patio },
		{ key: 'garden', picture: garden, alt: copy.placeAlts.garden }
	]);
</script>

<Seo {lang} page="visit" />

<header
	class="mx-auto max-w-page px-gutter pt-6 pb-12 motion-safe:animate-arrive md:pt-12 md:pb-16"
>
	<SectionHeading level={1} label={copy.label} title={copy.pageTitle} />
</header>

<!--
	A phone shows the whole front of the gallery. A wide screen has room for a low band of it
	only, and takes the bottom one: the entrance, the sign and the sculpture at the door.
-->
<div class="mx-auto max-w-page px-gutter arrive-after-1 motion-safe:animate-arrive">
	<enhanced:img
		src={facade}
		alt={copy.facadeAlt}
		sizes="(min-width: 1280px) 1216px, 100vw"
		fetchpriority="high"
		class="aspect-room size-full object-cover md:aspect-facade md:object-bottom"
	/>
</div>

<!-- Past the front: a patio of the gallery, and the workshop at the back, opening onto the garden. -->
<div class="mx-auto grid max-w-page gap-4 px-gutter pt-4 md:grid-cols-2 md:gap-6 md:pt-6">
	{#each places as place, index (place.key)}
		<enhanced:img
			src={place.picture}
			alt={place.alt}
			sizes="(min-width: 1280px) 37rem, (min-width: 768px) 48vw, 100vw"
			loading="lazy"
			class={['h-auto w-full reveal', index > 0 && 'reveal-after-1']}
		/>
	{/each}
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
