<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		photos: readonly Picture[];
		/** What each photo shows, in the same order as `photos`. */
		alts: readonly string[];
		class?: string;
	}

	let { photos, alts, class: className }: Props = $props();
</script>

<!--
	Photos of any shape set in columns, like a contact sheet: two on a phone, three on a wide
	screen. Each keeps its own shape and none is cropped. A photo with no description is
	treated as decoration.
-->
<div class={cn('columns-2 gap-3 md:columns-3 md:gap-6', className)}>
	{#each photos as photo, index (index)}
		<enhanced:img
			src={photo}
			alt={alts[index] ?? ''}
			sizes="(min-width: 1280px) 23rem, (min-width: 768px) 30vw, 46vw"
			loading="lazy"
			class="mb-3 h-auto w-full reveal break-inside-avoid md:mb-6"
		/>
	{/each}
</div>
