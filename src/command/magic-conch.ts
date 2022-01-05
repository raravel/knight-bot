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

export default {
	command: '소라고동',
	permission: null,
	async run(cmd: CommandMessage, client: Client) {
		let res: any = await got.get('https://kr.shindanmaker.com/329887');
		let $: any = cheerio.load(res.body);

		const cookie = cooker(res.headers['set-cookie']);
		const session = cookie._session.value;
		const token = $('#shindanForm').children('input[type=hidden]').val();

		res = await got.post('https://kr.shindanmaker.com/329887', {
			body: qs.encode({
				'_token': token,
				'shindanName': Date.now()+cmd.content,
				'hiddenName': `무명 ${String.fromCharCode(65 + Math.floor(Math.random()*10))}`,
			}),
			headers: {
				cookie: `_session=${session};`,
				'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.272 Whale/2.9.118.16 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded',
			},
			followRedirect: false,
		});
		$ = cheerio.load(res.body);
		const resText = $('#shindanResult').text();
		if ( resText ) {
			const m = resText.match(/'(.*?)'.*?'(.*?)'/) as any;
			if ( m ) {
				const reply: string = m[2];
				await cmd.message.reply(reply);
				return '';
			}
		}
		await cmd.message.reply('몰?루');
		return '';
	},
};
