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

	const SIZES = {
		alone: '(min-width: 1024px) 60vw, 100vw',
		paired: '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'
	};

	/** Photos go in pairs. With an odd number, the last one takes the whole row. */
	const alone = (index: number): boolean => photos.length % 2 === 1 && index === photos.length - 1;
</script>

<!--
	A work's photos, large and at their own shape. A photo takes its width from its own pixel
	size and is only ever scaled down, so a small catalog photo is never stretched.
-->
<div class={cn('grid items-center gap-4 sm:grid-cols-2 md:gap-6', className)}>
	{#each photos as photo, index (index)}
		<div class={cn('flex justify-center', alone(index) && 'sm:col-span-2')}>
			<enhanced:img
				src={photo}
				alt={alt(index)}
				sizes={alone(index) ? SIZES.alone : SIZES.paired}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				class="max-h-photo max-w-full object-contain"
			/>
		</div>
	{/each}
</div>
