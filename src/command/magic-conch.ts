/*
 * magic-conch.ts
 * Created on Wed Jan 05 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import {
	Client,
} from 'discord.js';
import cheerio from 'cheerio';
import got from 'got';
import { CommandMessage } from '.';
import { cooker } from '../common';
import qs from 'querystring';

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.272 Whale/2.9.118.16 Safari/537.36';

export default {
	command: '소라고동',
	permission: null,
    hide: false,
    usage: '소라고동 [질문]',
    description: '마법의 소라고동님이 고민을 해결해주실 것입니다.',
	async run(cmd: CommandMessage, client: Client) {
		let res: any = await got.get('http://m.tf.co.kr/sa2da/step1?idx=92', {
			headers: {
				'user-agent': USER_AGENT
			},
		});
		const cookie = cooker(res.headers['set-cookie']);
		const session = cookie['PHPSESSID'].value;

		res = await got.post('http://m.tf.co.kr/sa2da/ajaxcheck', {
			body: qs.encode({
				idx: 92,
				page: 0,
				qaid: 'ITEM_1485404592650',
				cdata: `ITEM_1485404592650_E_0|22|${cmd.content}`,
			}),
			headers: {
				cookie: `PHPSESSID=${session};`,
					'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'user-agent': USER_AGENT,
			},
		});

		res = await got.get('http://m.tf.co.kr/sa2da/step2?idx=92&page=0', {
			headers: {
				cookie: `PHPSESSID=${session};`,
					'user-agent': USER_AGENT
			},
		});

		res = await got.post('http://m.tf.co.kr/sa2da/ajaxcheck', {
			body: qs.encode({
				idx: 92,
				page: 1,
				qaid: 'ITEM_1485409103810',
				cdata: 'ITEM_1485409103810_E_0',
			}),
			headers: {
				cookie: `PHPSESSID=${session};`,
					'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'user-agent': USER_AGENT,
			},
		});

		const check = JSON.parse(res.body);
		if ( check.status === 'sucess' ) {
			res = await got.get('http://m.tf.co.kr/sa2da/step2?idx=92&page=1', {
				headers: {
					cookie: `PHPSESSID=${session};`,
						'user-agent': USER_AGENT
				},
			});
			let m: any = res.body.match(/.*?'.(.*)?'/);
			if ( m ) {
				const url = `http://m.tf.co.kr/sa2da${m[1]}`;
					res = await got.get(url, {
					headers: {
						cookie: `PHPSESSID=${session};`,
					},
				});
				let $: any = cheerio.load(res.body);
				m = $('#cutresult').text().match(/.*?"(.*)?"/);
				if ( m ) {
					await cmd.message.reply(m[1]);
					return '';
				}
			}
		}
		await cmd.message.reply('몰?루');
		return '';
	},
};
