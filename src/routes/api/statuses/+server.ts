import { error, json } from '@sveltejs/kit';
import type { Status } from '../../../util/types';
import type { GradeStatus } from '../../../util/types';
import { load } from 'cheerio';
import { titleCase } from 'title-case';
import { zonedTimeToUtc } from 'date-fns-tz';
import { OLD_STATUS_MAX_AGE, STATUS_MAX_AGE, WEBGRADES_URL } from '../../../util/constants';

function parseWebGrades(html: string): GradeStatus[] {
	const start = performance.now();
	const $ = load(html);
	const courses = $('.Courses');
	const entries = courses.find('tr');
	const gradeStatuses: GradeStatus[] = [];
	entries.each(function () {
		let courseCode = 0,
			dept = '',
			number = '',
			title = '',
			enrolled = 0,
			graded = 0,
			statusChangeDate = new Date(1970, 0, 1),
			status: Status = 'Error';

		const instructors: string[] = [];

		const cols = $(this).find('td');

		if (cols.length != 0) {
			// ignore header rows
			let isEmpty = false;

			cols.each(function (i) {
				if ($(this).text() == '') {
					// ignore empty rows
					isEmpty = true;
					return false;
				}

				switch (i) {
					case 0:
						courseCode = Number($(this).text());
						break;
					case 1:
						dept = $(this).text();
						break;
					case 2:
						number = $(this).text();
						break;
					case 3:
						title = titleCase($(this).text().toLowerCase());
						break;
					case 4:
						$(this)
							.html()
							?.toLowerCase()
							.split('<br>')
							.forEach((instructor) => {
								instructors.push(titleCase(instructor));
							});
						break;
					case 5:
						enrolled = Number($(this).text());
						break;
					case 6:
						graded = Number($(this).text());
						break;
					case 7:
						statusChangeDate = zonedTimeToUtc($(this).text(), 'America/Los_Angeles');
						break;
					case 8:
						status = $(this).text() as Status;
						break;
				}
			});

			if (!isEmpty) {
				gradeStatuses.push({
					courseCode,
					dept,
					number,
					title,
					instructors,
					enrolled,
					graded,
					statusChangeDate,
					status
				});
			}
		}
	});

	const end = performance.now();

	console.log('Scrape time:', end - start);

	return gradeStatuses;
}

function fetchWebGradesStatus(yearTerm: string, school: string): Promise<GradeStatus[] | null> {
	const body = new URLSearchParams({
		YearTerm: yearTerm,
		School: school,
		ShowSubscribed: '1',
		ShowSubmitted: '1',
		ShowUnsubscribed: '1',
		SortBy: 'CourseCode',
		FontSize: '100',
		Submit: 'Show Classes'
	});

	const start = performance.now();
	return fetch(WEBGRADES_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	})
		.then(async (res) => {
			if (!res.ok) {
				throw new Error(await res.text());
			}

			return res.text();
		})
		.then((text) => {
			const end = performance.now();
			console.log('Fetch time:', end - start);
			const gradeStatuses = parseWebGrades(text);
			return gradeStatuses;
		})
		.catch((error) => {
			console.log(error);
			return null;
		});
}

/**
 * currently returns true if yearTerm requested is from a previous calendar year
 * @param yearTerm
 * @returns true or false
 */
function shouldCacheLong(yearTerm: string) {
	const year = Number(yearTerm.split('-')[0]);

	const date = new Date();

	return date.getFullYear() > year;
}

export async function GET({ url, setHeaders }) {
	const yearTerm = url.searchParams.get('yearTerm');

	if (!yearTerm) {
		throw error(400, 'Invalid request. Missing yearTerm param.');
	}

	const gradeStatuses = await fetchWebGradesStatus(yearTerm, 'ANY');

	if (gradeStatuses == null) {
		throw error(500, 'Unable to fetch data from WebGrades');
	}

	setHeaders({
		'cache-control': shouldCacheLong(yearTerm)
			? `s-maxage=${OLD_STATUS_MAX_AGE}, max-age=${OLD_STATUS_MAX_AGE}`
			: `s-maxage=${STATUS_MAX_AGE}, max-age=${STATUS_MAX_AGE}`
	});

	return json(gradeStatuses);
}
