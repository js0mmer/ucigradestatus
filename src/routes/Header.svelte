<script lang="ts">
	import { browser } from '$app/environment';

	let darkMode = false;

	if (browser) {
		darkMode =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
	}

	$: {
		if (browser) {
			if (darkMode) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			}
		}
	}
</script>

<nav
	class="flex p-2 bg-white dark:bg-neutral-800 border-b dark:border-b-neutral-900 border-b-slate-200 drop-shadow-sm"
>
	<div class="flex-1 flex justify-center ml-auto" />
	<div>
		<h1
			class="font-robotoSlab tracking-[2px] text-center text-xl md:text-4xl font-semibold text-slate-700 dark:text-slate-100"
		>
			UCI Grade Status
		</h1>
	</div>
	<div class="flex-1 flex items-center ml-auto">
		<div class="ml-auto md:mr-4 text-xs md:text-base">
			<button class="md:mr-2" on:click={() => (darkMode = !darkMode)}>
				{darkMode ? '🌙' : '☀️'}
			</button>
			<a
				class="text-center text-slate-700 dark:text-slate-100 hover:text-blue-500 dark:hover:text-blue-500 text-xs md:text-base transition-colors duration-300"
				href="https://www.reg.uci.edu/perl/WebGradesStatus"
				target="_blank">WebGrades</a
			>
		</div>
	</div>
</nav>
