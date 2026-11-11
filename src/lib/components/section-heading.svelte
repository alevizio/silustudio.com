<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		title: string;
		/** Small caps line above the title. */
		label?: string;
		/** Heading level. Level 1 uses the display size. */
		level?: 1 | 2;
		/** Id on the heading, so a section can point at it with aria-labelledby. */
		id?: string;
		class?: string;
	}

	let { title, label, level = 2, id, class: className }: Props = $props();
</script>

<div class={cn('flex flex-col gap-3', className)}>
	{#if label}
		<p class="text-label text-ink-soft uppercase">{label}</p>
	{/if}
	<svelte:element
		this={`h${level}`}
		{id}
		class={cn('font-serif font-light text-balance', level === 1 ? 'text-display' : 'text-title')}
	>
		{title}
	</svelte:element>
</div>
