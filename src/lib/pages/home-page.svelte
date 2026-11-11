<script lang="ts">
	import hero from '#lib/assets/gallery/sala-01.jpg?enhanced';
	import roomPlinths from '#lib/assets/gallery/sala-02.jpg?enhanced';
	import roomCorridor from '#lib/assets/gallery/sala-03.jpg?enhanced';
	import roomGarden from '#lib/assets/gallery/sala-06.jpg?enhanced';
	import roomLong from '#lib/assets/gallery/sala-07.webp?enhanced';
	import artists from '#lib/assets/studio/artistas-01.jpg?enhanced';
	import GalleryFilm from '#lib/components/gallery-film.svelte';
	import LinkButton from '#lib/components/link-button.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorksWall from '#lib/components/works-wall.svelte';
	import { SITE } from '#lib/content/site.ts';
	import { PHOTOGRAPHED_WORKS } from '#lib/content/images.ts';
	import { pageHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	/** The four works shown on the home page, by slug: two landscape, one portrait, one square. */
	const FEATURED = ['guijarro', 'resplandor-circular', 'reencause', 'cause'];
	const featured = FEATURED.flatMap((slug) =>
		PHOTOGRAPHED_WORKS.filter((work) => work.slug === slug)
	);

	const ROOM_SIZES = {
		wide: '(min-width: 768px) 62vw, 100vw',
		narrow: '(min-width: 768px) 21vw, 100vw'
	};
	const rooms = [
		{ key: 'plinths', picture: roomPlinths, span: 'md:col-span-3', sizes: ROOM_SIZES.wide },
		{ key: 'corridor', picture: roomCorridor, span: '', sizes: ROOM_SIZES.narrow },
		{ key: 'long', picture: roomLong, span: '', sizes: ROOM_SIZES.narrow },
		{ key: 'garden', picture: roomGarden, span: '', sizes: ROOM_SIZES.narrow }
	] as const;

	const copy = $derived(copyFor(lang));
</script>

<Seo {lang} page="home" />

<!-- The page opens on the room itself, edge to edge. The way there comes right under it. -->
<section class="pb-section">
	<enhanced:img
		src={hero}
		alt={copy.home.heroAlt}
		sizes="100vw"
		fetchpriority="high"
		class="aspect-room max-h-hero w-full object-cover md:aspect-facade"
	/>
	<div class="mx-auto grid max-w-page gap-8 px-gutter pt-8 lg:grid-cols-12 lg:gap-x-16 lg:pt-12">
		<div class="flex flex-col gap-4 lg:col-span-7">
			<p class="text-label text-ink-soft uppercase">{copy.home.eyebrow}</p>
			<h1 class="font-serif text-display font-light text-balance">{copy.home.title}</h1>
		</div>
		<!-- The address and the way there come first, so they are in view when the page opens. -->
		<div class="flex flex-col gap-6 lg:col-span-5">
			<p class="text-label text-ink-soft uppercase">
				{SITE.address.street} · {SITE.address.locality}, {SITE.address.country}
			</p>
			<div class="flex flex-wrap gap-3">
				<LinkButton href={SITE.directionsUrl} external>{copy.visit.directions}</LinkButton>
				<LinkButton href={pageHref(lang, 'works')} variant="line">
					{copy.home.works.link}
				</LinkButton>
			</div>
			<p class="font-serif text-lead text-ink-soft">{copy.home.lead}</p>
		</div>
	</div>
</section>

<section aria-labelledby="home-gallery" class="mx-auto max-w-page px-gutter pb-section">
	<div class="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
		<SectionHeading
			id="home-gallery"
			label={copy.home.gallery.label}
			title={copy.home.gallery.title}
			class="max-w-prose"
		/>
		<LinkButton href={pageHref(lang, 'visit')} variant="text">{copy.home.gallery.link}</LinkButton>
	</div>
	<!-- The film sets the height of the row; the photos beside it fill that height. -->
	<div class="grid gap-4 md:grid-cols-12 md:gap-6">
		<GalleryFilm {lang} class="md:col-span-4" />
		<div class="grid gap-4 md:col-span-8 md:grid-cols-3 md:grid-rows-gallery md:gap-6">
			{#each rooms as room (room.key)}
				<div class={['relative aspect-room md:aspect-auto', room.span]}>
					<enhanced:img
						src={room.picture}
						alt={copy.home.gallery.alts[room.key]}
						sizes={room.sizes}
						loading="lazy"
						class="absolute inset-0 size-full object-cover"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>

<section aria-labelledby="home-works" class="mx-auto max-w-page px-gutter pb-10 md:pb-14">
	<div class="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
		<SectionHeading
			id="home-works"
			label={copy.home.works.label}
			title={copy.home.works.title}
			class="max-w-prose"
		/>
		<LinkButton href={pageHref(lang, 'works')} variant="text">{copy.home.works.link}</LinkButton>
	</div>
	<WorksWall works={featured} {lang} label={copy.home.works.label} />
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
		class="h-auto w-full lg:col-span-7"
	/>
	<div class="flex flex-col gap-6 lg:col-span-5">
		<SectionHeading
			id="home-artists"
			label={copy.home.artists.label}
			title={copy.home.artists.title}
		/>
		{#each copy.studio.statement.slice(0, 2) as paragraph (paragraph)}
			<p class="font-serif text-prose text-ink-soft">{paragraph}</p>
		{/each}
		<LinkButton href={pageHref(lang, 'studio')} variant="text">{copy.home.artists.link}</LinkButton>
	</div>
</section>
