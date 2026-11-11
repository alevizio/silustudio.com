<script lang="ts">
	import { WORK_PHOTOS } from '#lib/content/images.ts';
	import type { Work } from '#lib/content/works.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import WorkLabel from './work-label.svelte';

	interface Props {
		/** A work that has a full size photo. */
		work: Work;
		lang: Lang;
		/** The `sizes` attribute for the photo, matching the column it sits in. */
		sizes: string;
		class?: string;
	}

	let { work, lang, sizes, class: className }: Props = $props();

	const picture = $derived(work.photo ? WORK_PHOTOS[work.photo] : undefined);
	const alt = $derived(copyFor(lang).works.photoAlt(work.title, work.medium[lang]));
</script>

<!-- One work on the wall with its label underneath. -->
{#if picture}
	<figure class={cn('flex flex-col gap-5', className)}>
		<enhanced:img src={picture} {alt} {sizes} loading="lazy" class="h-auto w-full bg-plate" />
		<figcaption>
			<WorkLabel {work} {lang} />
		</figcaption>
	</figure>
{/if}
