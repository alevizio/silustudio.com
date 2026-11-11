<script lang="ts">
	import logo from '#lib/assets/brand/silu-logo-ink.png?enhanced';
	import { pageHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang, type PageKey } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import LangSwitch from './lang-switch.svelte';

	interface Props {
		lang: Lang;
		/** The page being shown, to mark its link as current. */
		current: PageKey | null;
		pathname: string;
		class?: string;
	}

	let { lang, current, pathname, class: className }: Props = $props();

	const NAV_PAGES = ['works', 'studio', 'visit'] as const satisfies readonly PageKey[];

	const copy = $derived(copyFor(lang).nav);
</script>

<header
	class={cn(
		'mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-x-10 gap-y-1 px-gutter pt-5 pb-3 md:py-8',
		className
	)}
>
	<a href={pageHref(lang, 'home')} aria-label={copy.home} class="block">
		<enhanced:img src={logo} alt="" class="h-logo w-auto" />
	</a>

	<nav aria-label={copy.label} class="order-last w-full md:order-none md:ml-auto md:w-auto">
		<ul class="flex items-center gap-8 md:gap-10">
			{#each NAV_PAGES as key (key)}
				<li>
					<a
						href={pageHref(lang, key)}
						aria-current={current === key ? 'page' : undefined}
						class="inline-flex min-h-11 items-center border-b border-transparent text-label text-ink-soft uppercase transition-colors hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink"
					>
						{copy[key]}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<LangSwitch {lang} {pathname} />
</header>
