<script lang="ts">
	import hero from '#lib/assets/gallery/sala-01.jpg?enhanced';
	import roomPlinths from '#lib/assets/gallery/sala-02.jpg?enhanced';
	import roomCorridor from '#lib/assets/gallery/sala-03.jpg?enhanced';
	import roomGarden from '#lib/assets/gallery/sala-06.jpg?enhanced';
	import artists from '#lib/assets/studio/artistas-01.jpg?enhanced';
	import GalleryFilm from '#lib/components/gallery-film.svelte';
	import LinkButton from '#lib/components/link-button.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorkPlate from '#lib/components/work-plate.svelte';
	import { SITE } from '#lib/content/site.ts';
	import { PHOTOGRAPHED_WORKS, WORKS } from '#lib/content/works.ts';
	import { pageHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	/** Catalog numbers of the three works shown on the home page. */
	const FEATURED = [1, 19, 6];
	const featured = FEATURED.flatMap((n) => PHOTOGRAPHED_WORKS.filter((work) => work.n === n));

	const ROOM_SIZES = {
		wide: '(min-width: 768px) 62vw, 100vw',
		narrow: '(min-width: 768px) 31vw, 100vw'
	};
	const rooms = [
		{ key: 'plinths', picture: roomPlinths, span: 'md:col-span-2', sizes: ROOM_SIZES.wide },
		{ key: 'corridor', picture: roomCorridor, span: '', sizes: ROOM_SIZES.narrow },
		{ key: 'garden', picture: roomGarden, span: '', sizes: ROOM_SIZES.narrow }
	] as const;

	const copy = $derived(copyFor(lang));
</script>

<Seo {lang} page="home" />

<section
	class="mx-auto grid max-w-page gap-8 px-gutter pt-2 pb-section lg:grid-cols-12 lg:items-center lg:gap-x-16 lg:pt-6"
>
	<div class="flex flex-col gap-6 lg:col-span-5">
		<p class="text-label text-ink-soft uppercase">{copy.home.eyebrow}</p>
		<h1 class="font-serif text-display font-light text-balance">{copy.home.title}</h1>
		<p class="font-serif text-lead text-ink-soft">{copy.home.lead}</p>
		<div class="flex flex-wrap gap-3 pt-2">
			<LinkButton href={SITE.directionsUrl} external>{copy.visit.directions}</LinkButton>
			<LinkButton href={pageHref(lang, 'works')} variant="line">{copy.home.works.link}</LinkButton>
		</div>
		<p class="text-sm text-ink-soft">
			{SITE.address.street} · {SITE.address.locality}, {SITE.address.country}
		</p>
	</div>
	<enhanced:img
		src={hero}
		alt={copy.home.heroAlt}
		sizes="(min-width: 1024px) 55vw, 100vw"
		fetchpriority="high"
		class="order-first h-auto w-full lg:order-none lg:col-span-7"
	/>
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
		<div class="grid gap-4 md:col-span-8 md:grid-cols-2 md:grid-rows-gallery md:gap-6">
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

<section aria-labelledby="home-works" class="mx-auto max-w-page px-gutter pb-section">
	<div class="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
		<SectionHeading
			id="home-works"
			label={copy.home.works.label}
			title={copy.home.works.title(WORKS.length)}
			class="max-w-prose"
		/>
		<LinkButton href={pageHref(lang, 'works')} variant="text">{copy.home.works.link}</LinkButton>
	</div>
	<div class="grid gap-x-6 gap-y-12 md:grid-cols-3">
		{#each featured as work (work.n)}
			<WorkPlate {work} {lang} sizes="(min-width: 768px) 30vw, 100vw" />
		{/each}
	</div>
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
