<script lang="ts">
	import type GradeStatus from '../types/gradeStatus';
	import { onMount } from 'svelte';
	import search from 'websoc-fuzzy-search';
	import Spinner from './spinner.svelte';
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

	let gradeStatuses: GradeStatus[] = [];

	let fail = false;

	function fetchGradeStatuses(yearTerm: string) {
		let searchParams = new URLSearchParams({ yearTerm });
		fetch('/api/statuses?' + searchParams)
			.then(async (res) => {
				if (!res.ok) {
					alert((await res.json()).message);
					fail = true;
					return null;
				}

				return res.json();
			})
			.then((res) => {
				gradeStatuses = res.map((value: any) => {
					value.statusChangeDate = new Date(value.statusChangeDate as string);
					return value;
				});

				fail = false;
			});
	}

	onMount(() => {
		fetchGradeStatuses('2023-14');
	});

	let course = '';
	let instructor = '';
	let filteredGradeStatuses: GradeStatus[] = [];

	const PAGE_SIZE = 30;

	$: {
		if (!course && !instructor) {
			filteredGradeStatuses = gradeStatuses.slice(0, PAGE_SIZE);
		} else if (gradeStatuses.length != 0) {
			filteredGradeStatuses = gradeStatuses;

			if (course) {
				let courseResults = search({ query: course, resultType: 'COURSE' });

				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					let courseName = value.dept.toUpperCase().replace(' ', '') + value.number.toUpperCase();
					return courseResults[courseName];
				});
			}

			if (instructor) {
				let instructorResults = search({ query: instructor, resultType: 'INSTRUCTOR' });

				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					return value.instructors.some(
						(instructor) => instructorResults[instructor.toUpperCase()]
					);
				});
			}

			filteredGradeStatuses = filteredGradeStatuses.slice(0, PAGE_SIZE);
		}
	}
</script>

<svelte:head>
	<title>UCI Grade Status</title>
</svelte:head>
<nav
	class="flex p-2 bg-white dark:bg-neutral-800 border-b dark:border-b-neutral-800 border-b-slate-200 drop-shadow-sm"
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
			<button class="mr-2" on:click={() => (darkMode = !darkMode)}>{darkMode ? '🌙' : '☀️'}</button>
			<a
				class="text-center text-slate-700 dark:text-slate-100 hover:text-blue-500 dark:hover:text-blue-500 text-xs md:text-base transition-colors duration-300"
				href="https://www.reg.uci.edu/perl/WebGradesStatus"
				target="_blank">WebGrades</a
			>
		</div>
	</div>
</nav>
<main class="md:container md:mx-auto xl:px-48 py-4">
	<input
		bind:value={course}
		class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-slate-100 border rounded-md m-1 border-slate-200 hover:border-slate-300 focus:border-blue-300 px-2 py-1 outline-none"
		type="text"
		placeholder="Course"
		id="course"
	/>
	<input
		bind:value={instructor}
		class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-slate-100 border rounded-md m-1 border-slate-200 hover:border-slate-300 focus:border-blue-300 px-2 py-1 outline-none"
		type="text"
		placeholder="Instructor"
		id="instructor"
	/>
	<div class="overflow-x-auto">
		<table class="w-full mt-4">
			<thead>
				<tr class="border-b p-2 border-b-slate-200">
					<th class="border-r p-2 border-x-slate-200">Course Code</th>
					<th class="border-x p-2 border-x-slate-200">Dept</th>
					<th class="border-x p-2 border-x-slate-200">Number</th>
					<th class="border-x p-2 border-x-slate-200">Title</th>
					<th class="border-x p-2 border-x-slate-200">Instructor</th>
					<th class="border-x p-2 border-x-slate-200">Enrolled</th>
					<th class="border-x p-2 border-x-slate-200">Graded</th>
					<th class="border-x p-2 border-x-slate-200">Status Change Date</th>
					<th class="border-l p-2 border-x-slate-200">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredGradeStatuses as entry}
					<tr class="border-t p-2 border-t-slate-200">
						<td class="border-r p-2 border-x-slate-200">
							{String(entry.courseCode).padStart(5, '0')}
						</td>
						<td class="border-x p-2 border-x-slate-200">{entry.dept}</td>
						<td class="border-x p-2 border-x-slate-200">{entry.number}</td>
						<td class="border-x p-2 border-x-slate-200">{entry.title}</td>
						<td class="border-x p-2 border-x-slate-200">
							{#if entry.instructors.length == 1}
								{entry.instructors[0]}
							{:else}
								{#each entry.instructors as instructor}
									{instructor}<br />
								{/each}
							{/if}
						</td>
						<td class="border-x p-2 border-x-slate-200">{entry.enrolled}</td>
						<td class="border-x p-2 border-x-slate-200">{entry.graded}</td>
						<td class="border-x p-2 border-x-slate-200">
							{entry.statusChangeDate.toLocaleString('en-us', {
								weekday: 'short',
								year: 'numeric',
								month: 'short',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric'
							})}
						</td>
						<td
							class:text-green-400={entry.status == 'Submitted'}
							class:text-yellow-400={entry.status == 'Tardy'}
							class:text-red-400={entry.status == 'Unsubscribed' || entry.status == 'Error'}
							class="border-l p-2 border-x-slate-200">{entry.status}</td
						>
					</tr>
				{:else}
					{#if gradeStatuses.length != 0}
						No Results Found
					{/if}
				{/each}
			</tbody>
		</table>
		{#if fail}
			<div class="flex w-full justify-center py-40 text-8xl">💀</div>
		{:else if gradeStatuses.length == 0}
			<div class="flex w-full justify-center p-20">
				<Spinner size="10em" thickness="1em" accentColor="#34aeeb" />
			</div>
		{/if}
	</div>
</main>
