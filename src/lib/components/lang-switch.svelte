<script lang="ts">
	import { alternateHref } from '#lib/i18n/href.ts';
	import { LANGS, copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** Current path, used to link to the same page in the other language. */
		pathname: string;
		class?: string;
	}

	let { lang, pathname, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).nav);
	const alternate = $derived(alternateHref(pathname));
	const itemClass = 'inline-flex min-h-11 min-w-8 items-center justify-center';
</script>

{#snippet name(code: Lang)}
	<span aria-hidden="true">{code}</span>
	<span class="sr-only">{copy.languageNames[code]}</span>
{/snippet}

<nav aria-label={copy.language} class={cn('text-label uppercase', className)}>
	<ul class="flex items-center gap-1">
		{#each LANGS as code, index (code)}
			<li class="flex items-center gap-1">
				{#if index > 0}
					<span aria-hidden="true" class="text-ink-soft">/</span>
				{/if}
				{#if code === lang}
					<span aria-current="true" class={cn(itemClass, 'text-ink')}>
						{@render name(code)}
					</span>
				{:else}
					<a
						href={alternate}
						hreflang={code}
						lang={code}
						class={cn(itemClass, 'text-ink-soft transition-colors hover:text-ink')}
					>
						{@render name(code)}
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
