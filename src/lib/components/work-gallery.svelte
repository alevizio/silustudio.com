<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		photos: readonly Picture[];
		/** Alt text for photo number `n` of `total`. */
		alt: (n: number, total: number) => string;
		/** Name of the button that shows photo number `n`. */
		showLabel: (n: number) => string;
		/** Name of the group of small photos. */
		label: string;
		class?: string;
	}

	let { photos, alt, showLabel, label, class: className }: Props = $props();

	let selected = $state(0);
	const current = $derived(photos[selected] ?? photos[0]);

	// A photo takes its width from its own pixel size (the width attribute) and is only ever
	// scaled down to fit the plate, so a small catalog photo is never stretched.
	const photoClass = 'max-h-full max-w-full object-contain';
	const plateClass = 'flex aspect-square items-center justify-center overflow-hidden bg-plate';
</script>

<!-- One photo hung large on a plate, with the others below to swap in. -->
{#if current}
	<div class={cn('flex flex-col gap-4', className)}>
		<div class={plateClass}>
			<enhanced:img
				src={current}
				alt={alt(selected + 1, photos.length)}
				sizes="(min-width: 1024px) 55vw, 100vw"
				fetchpriority="high"
				class={photoClass}
			/>
		</div>
		{#if photos.length > 1}
			<ul aria-label={label} class="grid grid-cols-4 gap-4">
				{#each photos as photo, index (index)}
					<li>
						<button
							type="button"
							aria-label={showLabel(index + 1)}
							aria-pressed={index === selected}
							onclick={() => (selected = index)}
							class={cn(
								plateClass,
								'w-full cursor-pointer p-2 aria-pressed:ring-1 aria-pressed:ring-ink'
							)}
						>
							<enhanced:img src={photo} alt="" sizes="20vw" loading="lazy" class={photoClass} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
