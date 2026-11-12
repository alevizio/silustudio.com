<script lang="ts">
	import facade from '#lib/assets/gallery/fachada.jpg?enhanced';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import SectionHeading from './section-heading.svelte';
	import VisitDetails from './visit-details.svelte';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const HEADING_ID = 'visit-band-title';
	const copy = $derived(copyFor(lang).visit);
</script>

<!-- Closes every page except Visit itself: the invitation to come to the gallery. -->
<section aria-labelledby={HEADING_ID} class={cn('bg-plate', className)}>
	<div class="mx-auto grid max-w-page gap-12 px-gutter py-section lg:grid-cols-12 lg:gap-x-16">
		<div class="flex reveal flex-col gap-10 lg:col-span-5">
			<SectionHeading id={HEADING_ID} label={copy.label} title={copy.title} />
			<VisitDetails {lang} />
		</div>
		<enhanced:img
			src={facade}
			alt={copy.facadeAlt}
			sizes="(min-width: 1024px) 55vw, 100vw"
			loading="lazy"
			class="aspect-room size-full reveal object-cover reveal-after-1 lg:col-span-7"
		/>
	</div>
</section>
