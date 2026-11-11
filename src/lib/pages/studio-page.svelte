<script lang="ts">
	import portrait from '#lib/assets/studio/artistas-01.jpg?enhanced';
	import workshop from '#lib/assets/studio/artistas-02.jpg?enhanced';
	import drawing from '#lib/assets/studio/artistas-03.jpg?enhanced';
	import storage from '#lib/assets/gallery/sala-04.jpg?enhanced';
	import ArtistsFilm from '#lib/components/artists-film.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	const copy = $derived(copyFor(lang).studio);
	const proseClass = 'text-prose text-ink-soft font-serif';
	const photos = $derived([
		{ picture: workshop, alt: copy.alts.workshop },
		{ picture: drawing, alt: copy.alts.drawing },
		{ picture: storage, alt: copy.alts.storage }
	]);
</script>

<Seo {lang} page="studio" />

<header class="mx-auto max-w-page px-gutter pt-6 pb-12 md:pt-12 md:pb-16">
	<SectionHeading level={1} label={copy.label} title={copy.title} />
</header>

<div class="mx-auto max-w-page px-gutter">
	<ArtistsFilm {lang} poster={portrait} posterAlt={copy.alts.portrait} />
</div>

<section
	aria-label={copy.label}
	class="mx-auto grid max-w-page gap-12 px-gutter py-section lg:grid-cols-12 lg:gap-x-16"
>
	<div class="flex max-w-prose flex-col gap-6 lg:col-span-7">
		<p class="font-serif text-lead text-ink">{copy.statement[0]}</p>
		{#each copy.statement.slice(1) as paragraph (paragraph)}
			<p class={proseClass}>{paragraph}</p>
		{/each}
	</div>
	<div class="flex flex-col gap-10 lg:col-span-5">
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

<div class="mx-auto grid max-w-page gap-4 px-gutter pb-section md:grid-cols-3 md:gap-6">
	{#each photos as photo (photo.alt)}
		<enhanced:img
			src={photo.picture}
			alt={photo.alt}
			sizes="(min-width: 768px) 32vw, 100vw"
			loading="lazy"
			class="aspect-room size-full object-cover"
		/>
	{/each}
</div>
