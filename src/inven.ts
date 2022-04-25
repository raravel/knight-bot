import axios from 'axios';
import cheerio from 'cheerio';

export async function getIncidentBoard(keyword: string) {
	const res = await axios({
		url: 'https://www.inven.co.kr/board/lostark/5355',
		method: 'get',
		params: {
			query: 'list',
			p: 1,
			name: 'subjcont',
			keyword,
		},
	});

	const $ = cheerio.load(res.data);
	const list: any = [];
	$('form[name="board_list1"] tbody tr').each((_, elem) => {
		if ( $(elem).attr('class')?.trim().includes('notice') ) {
			return;
		}

		const title = $(elem).find('a.subject-link')?.text().trim().replace(/\s{5,}/, ' ');
		const idx = parseInt($(elem).find('td.num span')?.text().trim(), 10) || 0;
		const link = `https://www.inven.co.kr/board/lostark/5355/${idx}`;

		if ( !idx ) {
			return;
		}
		list.push({
			title,
			idx,
			link,
		});
	});
	return list;
}
