import { error, json } from '@sveltejs/kit';
import { WEBGRADES_URL, YEARTERMS_MAX_AGE } from '../../../util/constants';
import { load } from 'cheerio';
import type { YearTerm, YearTermsResponse } from '../../../util/types';

function parseYearTerms(html: string): YearTermsResponse {
	const $ = load(html);
	const yearTermSelect = $('[name=YearTerm]');
	const yearTerms: YearTerm[] = [];
	let defaultTerm = '';
	yearTermSelect.find('option').each(function () {
		const value = $(this).attr('value') ?? '';
		const name = $(this).text();

		if ($(this).attr('selected')) {
			defaultTerm = value;
		}

		yearTerms.push({
			value,
			name
		});
	});

	return { defaultTerm, yearTerms };
}

function fetchYearTerms() {
	return fetch(WEBGRADES_URL)
		.then(async (res) => {
			if (!res.ok) {
				throw new Error(await res.text());
			}

			return res.text();
		})
		.then((text) => {
			return parseYearTerms(text);
		})
		.catch((error) => {
			console.log(error);
			return null;
		});
}

export async function GET({ setHeaders }) {
	const yearTerms = await fetchYearTerms();

	if (!yearTerms) {
		throw error(500, 'Unable to fetch YearTerm options from WebGrades');
	}

	setHeaders({
		'cache-control': `s-maxage=${YEARTERMS_MAX_AGE}, max-age=${YEARTERMS_MAX_AGE}`
	});

	return json(yearTerms);
}
