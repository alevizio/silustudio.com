<script lang="ts">
	import portrait from '#lib/assets/studio/artistas-01.jpg?enhanced';
	import storage from '#lib/assets/gallery/sala-04.jpg?enhanced';
	import ArtistsFilm from '#lib/components/artists-film.svelte';
	import HungPair from '#lib/components/hung-pair.svelte';
	import PhotoColumns from '#lib/components/photo-columns.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import WorkshopReels from '#lib/components/workshop-reels.svelte';
	import Seo from '#lib/components/seo.svelte';
	import { AT_WORK_PHOTOS, DRAWING_PHOTO, WORKSHOP_PHOTO } from '#lib/content/images.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	/** How many of the photos of the artists at work hang among the wall texts. The rest follow. */
	const HUNG_AT_WORK = 2;

	const copy = $derived(copyFor(lang).studio);
	const [together, sanding] = AT_WORK_PHOTOS;
	const statementClass = 'reveal font-serif text-title font-light text-balance';
	const proseClass = 'text-prose text-ink-soft font-serif';
</script>

<Seo {lang} page="studio" />

<header
	class="mx-auto max-w-page px-gutter pt-6 pb-12 motion-safe:animate-arrive md:pt-12 md:pb-16"
>
	<SectionHeading level={1} label={copy.label} title={copy.title} />
</header>

<div class="mx-auto max-w-page px-gutter arrive-after-1 motion-safe:animate-arrive">
	<ArtistsFilm {lang} poster={portrait} posterAlt={copy.alts.portrait} />
</div>

<!--
	The statement is hung like the wall texts of an exhibition: broken into its paragraphs, each
	with room around it, and the photos hang between them at uneven sizes. The first and the
	last paragraph are set large, as what the room says first and last.
-->
<section
	aria-label={copy.label}
	class="mx-auto flex max-w-page flex-col gap-section px-gutter py-section"
>
	<p class={[statementClass, 'max-w-4xl']}>{copy.statement[0]}</p>

	<HungPair
		large={{ picture: together, alt: copy.atWork.alts[0] }}
		small={{ picture: sanding, alt: copy.atWork.alts[1] }}
		text={copy.statement[1]}
	/>

	<p class={[proseClass, 'mx-auto max-w-prose reveal']}>{copy.statement[2]}</p>

	<HungPair
		flipped
		large={{ picture: WORKSHOP_PHOTO, alt: copy.alts.workshop }}
		small={{ picture: storage, alt: copy.alts.storage }}
		text={copy.statement[3]}
	/>

	<p class={[statementClass, 'max-w-4xl lg:ml-auto']}>{copy.statement[4]}</p>
</section>

<!-- Who the two artists are, beside a photo of them planning a work. -->
<section
	aria-label={copy.title}
	class="mx-auto grid max-w-page gap-10 px-gutter pb-section lg:grid-cols-12 lg:items-end lg:gap-x-16"
>
	<enhanced:img
		src={DRAWING_PHOTO}
		alt={copy.alts.drawing}
		sizes="(min-width: 1280px) 41rem, (min-width: 1024px) 55vw, 100vw"
		loading="lazy"
		class="h-auto w-full reveal lg:col-span-7"
	/>
	<div class="flex reveal flex-col gap-8 reveal-after-1 lg:col-span-4 lg:col-start-9">
		<dl class="flex flex-col border-t border-line">
			{#each copy.bios as bio (bio.name)}
				<div class="flex flex-col gap-1 border-b border-line py-5">
					<dt class="text-label text-ink uppercase">{bio.name}</dt>
					<dd class="text-sm leading-relaxed text-ink-soft">{bio.roles}</dd>
				</div>
			{/each}
		</dl>
		{#each copy.closing as paragraph (paragraph)}
			<p class={proseClass}>{paragraph}</p>
		{/each}
	</div>
</section>

<!--
	The workshop itself: the artists' own short films of the work, then the rest of the photos
	of them and their helpers at it.
-->
<section aria-labelledby="studio-at-work" class="mx-auto max-w-page px-gutter pb-section">
	<h2 id="studio-at-work" class="reveal pb-6 text-label text-ink-soft uppercase">
		{copy.atWork.title}
	</h2>
	<WorkshopReels {lang} class="pb-3 md:pb-6" />
	<PhotoColumns
		photos={AT_WORK_PHOTOS.slice(HUNG_AT_WORK)}
		alts={copy.atWork.alts.slice(HUNG_AT_WORK)}
	/>
</section>
