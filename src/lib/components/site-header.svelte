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
		'mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-x-10 gap-y-1 px-gutter pt-5 pb-3 keeps-its-place md:py-8',
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
						class="relative inline-flex min-h-11 items-center text-label text-ink-soft uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-(--motion-fill) after:ease-settle hover:text-ink hover:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100"
					>
						{copy[key]}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<LangSwitch {lang} {pathname} />
</header>
