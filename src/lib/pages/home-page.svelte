<script lang="ts">
	import artists from '#lib/assets/studio/artistas-01.jpg?enhanced';
	import GalleryRooms from '#lib/components/gallery-rooms.svelte';
	import LinkButton from '#lib/components/link-button.svelte';
	import OpeningPhoto from '#lib/components/opening-photo.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import SpacesMosaic from '#lib/components/spaces-mosaic.svelte';
	import { SITE } from '#lib/content/site.ts';
	import { HERO_PHOTO, HERO_PHOTO_TALL, SPACES_PHOTOS } from '#lib/content/images.ts';
	import { pageHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	const copy = $derived(copyFor(lang));
</script>

<Seo {lang} page="home" />

<!--
	The page opens on the room itself, edge to edge: a square photo on a phone and a horizontal
	one on a wide screen. The way there comes right under it. On a phone the space under the
	photo is a little tighter, so that the square photo, what Silu is and "Cómo llegar" all fit
	on the first screen of a phone such as an iPhone 14.
-->
<section class="pb-section">
	<!-- The photo starts a touch too close and settles back as the page opens. -->
	<div class="aspect-square max-h-hero w-full overflow-hidden md:aspect-facade">
		<OpeningPhoto
			tall={HERO_PHOTO_TALL}
			wide={HERO_PHOTO}
			alt={copy.home.heroAlt}
			class="motion-safe:animate-settle"
		/>
	</div>
	<div
		class="mx-auto grid max-w-page gap-5 px-gutter pt-6 md:gap-8 md:pt-8 lg:grid-cols-12 lg:gap-x-16 lg:pt-12"
	>
		<div class="flex flex-col gap-4 motion-safe:animate-arrive lg:col-span-7">
			<h1 class="font-serif text-display font-light text-balance">{copy.home.title}</h1>
		</div>
		<!-- Where it is and the way there come first, so they are in view when the page opens. -->
		<div
			class="flex flex-col gap-4 arrive-after-1 motion-safe:animate-arrive md:gap-6 lg:col-span-5"
		>
			<p class="text-label text-ink-soft uppercase">{copy.home.place}</p>
			<div class="flex flex-wrap gap-3">
				<LinkButton href={SITE.directionsUrl} external>{copy.visit.directions}</LinkButton>
				<LinkButton href={pageHref(lang, 'works')} variant="line">
					{copy.home.works.link}
				</LinkButton>
			</div>
			<div class="flex flex-col gap-4 font-serif text-lead text-ink-soft">
				{#each copy.home.lead as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<section aria-labelledby="home-gallery" class="mx-auto max-w-page px-gutter pb-section">
	<div
		class="flex reveal flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-14"
	>
		<SectionHeading
			id="home-gallery"
			label={copy.home.gallery.label}
			title={copy.home.gallery.title}
			class="max-w-prose"
		/>
		<LinkButton href={pageHref(lang, 'visit')} variant="text">{copy.home.gallery.link}</LinkButton>
	</div>
	<GalleryRooms {lang} />
</section>

<section aria-labelledby="home-works" class="mx-auto max-w-page px-gutter pb-10 md:pb-14">
	<div
		class="flex reveal flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-14"
	>
		<SectionHeading
			id="home-works"
			label={copy.home.works.label}
			title={copy.home.works.title}
			class="max-w-prose"
		/>
		<LinkButton href={pageHref(lang, 'works')} variant="text">{copy.home.works.link}</LinkButton>
	</div>
	<SpacesMosaic photos={SPACES_PHOTOS} alts={copy.home.works.spaces} />
</section>

<section
	aria-labelledby="home-artists"
	class="mx-auto grid max-w-page gap-10 px-gutter pb-section lg:grid-cols-12 lg:items-center lg:gap-x-16"
>
	<enhanced:img
		src={artists}
		alt={copy.home.artists.alt}
		sizes="(min-width: 1024px) 55vw, 100vw"
		loading="lazy"
		class="h-auto w-full reveal lg:col-span-7"
	/>
	<div class="flex reveal flex-col gap-6 reveal-after-1 lg:col-span-5">
		<SectionHeading
			id="home-artists"
			label={copy.home.artists.label}
			title={copy.home.artists.title}
		/>
		<!-- Their statement is on the studio page; the home page is for photos (Ale, 23 Nov 2026). -->
		<LinkButton href={pageHref(lang, 'studio')} variant="text">{copy.home.artists.link}</LinkButton>
	</div>
</section>
