<script lang="ts">
	import search, { type SearchResult } from 'websoc-fuzzy-search';
	import { error, loading, results } from '../util/stores';
	import { PAGE_SIZE } from '../util/constants';
	import type { GradeStatus, YearTerm, YearTermsResponse } from '../util/types';
	import { onMount } from 'svelte';

	let course = '';
	let instructor = '';

	let gradeStatuses: GradeStatus[] = [];
	let yearTerms: YearTerm[] = [];
	let yearTerm: string;

	let courseSearchResults: Record<string, SearchResult>;
	let instructorSearchResults: Record<string, SearchResult>;

	$: courseSearchResults = search({ query: course, resultType: 'COURSE' });
	$: instructorSearchResults = search({ query: instructor, resultType: 'INSTRUCTOR' });

	$: {
		if (!course && !instructor) {
			results.set(gradeStatuses.slice(0, PAGE_SIZE));
		} else if (gradeStatuses.length != 0) {
			let filteredGradeStatuses = gradeStatuses;

			if (course) {
				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					let courseName = value.dept.toUpperCase().replace(' ', '') + value.number.toUpperCase();
					return courseSearchResults[courseName];
				});
			}

			if (instructor) {
				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					return value.instructors.some(
						(instructor) => instructorSearchResults[instructor.toUpperCase()]
					);
				});
			}

			results.set(filteredGradeStatuses.slice(0, PAGE_SIZE));
		}
	}

	function fetchGradeStatuses(yearTerm: string) {
		let searchParams = new URLSearchParams({ yearTerm: yearTerm });
		fetch('/api/statuses?' + searchParams)
			.then(async (res) => {
				if (!res.ok) {
					throw new Error((await res.json()).message ?? res.statusText);
				}

				return res.json();
			})
			.then((res: GradeStatus[]) => {
				gradeStatuses = res.map((value: any) => {
					value.statusChangeDate = new Date(value.statusChangeDate as string);
					return value;
				});

				loading.set(false);
			})
			.catch((err) => {
				alert(err);
				error.set(true);
			});
	}

	function fetchYearTerms() {
		fetch('/api/yearterms')
			.then(async (res) => {
				if (!res.ok) {
					throw new Error((await res.json()).message ?? res.statusText);
				}

				return res.json();
			})
			.then((json: YearTermsResponse) => {
				yearTerms = json.yearTerms;
				yearTerm = json.defaultTerm;
			})
			.catch((err) => {
				alert(err);
				error.set(true);
			});
	}

	$: {
		if (yearTerm) {
			loading.set(true);
			results.set([]);
			fetchGradeStatuses(yearTerm);
		}
	}

	onMount(() => {
		fetchYearTerms();
	});
</script>

<input
	bind:value={course}
	class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-neutral-100 border rounded-md m-1 border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 focus:border-blue-300 dark:focus:border-blue-300 px-2 py-1 outline-none"
	type="text"
	placeholder="Course"
	id="course"
/>
<input
	bind:value={instructor}
	class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-neutral-100 border rounded-md m-1 border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 focus:border-blue-300 dark:focus:border-blue-300 px-2 py-1 outline-none"
	type="text"
	placeholder="Instructor"
	id="instructor"
/>
<select
	class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-neutral-100 border rounded-md m-1 border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 focus:border-blue-300 dark:focus:border-blue-300 px-2 py-[0.3rem] outline-none"
	bind:value={yearTerm}
>
	{#each yearTerms as option}
		<option value={option.value}>{option.name}</option>
	{/each}
</select>
