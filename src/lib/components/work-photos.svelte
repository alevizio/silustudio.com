<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		photos: readonly Picture[];
		/** Alt text for the photo at this place in `photos`, counting from 0. */
		alt: (index: number) => string;
		/** Loads the photos at once. For the photo a page opens on. */
		eager?: boolean;
		class?: string;
	}

	let { photos, alt, eager = false, class: className }: Props = $props();

	/** The photos fill the column beside a work's label, or the whole screen on a phone. */
	const SIZES = '(min-width: 1536px) 74rem, (min-width: 1024px) calc(100vw - 26rem), 100vw';
</script>

<!--
	A work's photos, one to a row, each as large as its column or as tall as the screen allows,
	so a whole work is always in view at once. A photo takes its width from its own pixel size
	and is only ever scaled down, so a small catalog photo is never stretched.
-->
<div class={cn('flex flex-col items-center gap-4 md:gap-6', className)}>
	{#each photos as photo, index (index)}
		<enhanced:img
			src={photo}
			alt={alt(index)}
			sizes={SIZES}
			loading={eager ? 'eager' : 'lazy'}
			fetchpriority={eager ? 'high' : 'auto'}
			class="max-h-photo max-w-full reveal object-contain"
		/>
	{/each}
</div>
