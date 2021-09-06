/*
 * lark-api.ts
 * Created on Thu Sep 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import path from 'path';
import got from 'got';
import cheerio from 'cheerio';

export interface LarkUser {
	name: string;
	clan: string;
	expLevel: number;
	level: number;
	itemLevel: number;
	server: string;
	class: string;
	offense: number;
	life: number;
	battle: any[];
	engrave: any[];
}

export class LarkApi {

	private schema: string = 'https://';
	private host: string = 'lostark.game.onstove.com';

	private async req(url: string, ...args: string[]) {
		args.forEach((arg: string, idx: number) => {
			url = url.replaceAll(`{${idx}}`, arg);
		});
		return await got.get(this.schema + path.join(this.host, url));
	}

	async getUser(name: string): Promise<LarkUser> {
		const res = await this.req('/Profile/Character/{0}', name);
		const $ = cheerio.load(res.body);
		const expLevel = parseInt($('.level-info__expedition').text().match(/Lv\.([0-9,.]*)/)?.[1] as string) || 0;
		const level = parseInt($('.level-info__item').text().match(/Lv\.([0-9,.]*)/)?.[1] as string) || 0;
		const itemLevel = parseFloat($('.level-info2__item').text().match(/Lv\.([0-9,.]*)/)?.[1].replace(',', '') as string) || 0;
		const server = $('.profile-character-info__server').text().replace('@', '');
		const clan = $($('.game-info__guild').children()[1]).text();
		
		const basicTmp = $('.profile-ability-basic ul li span');
		const offense = parseInt($(basicTmp[1]).text());
		const life = parseInt($(basicTmp[3]).text());

		const battle: any[] = [];
		$('.profile-ability-battle ul > li').each((idx, elem) => {
			const child = $(elem).children('span');
			const text = $(child[0]).text();
			const value = parseInt($(child[1]).text());

			if ( text ) {
				battle.push({ text, value });
			}
		});

		const engrave: any[] = [];
		$('.profile-ability-engrave ul.swiper-slide li > span').each((idx, elem) => {
			const m = $(elem).text().match(/(.*)? Lv\. (\d+)/);
			if ( m ) {
				engrave.push({
					text: m[1],
					value: parseInt(m[2]),
				});
			}
		});

		return {
			engrave,
			battle,
			server,
			expLevel,
			level,
			name,
			clan,
			itemLevel,
			class: $('.profile-character-info__img').attr('alt') as string,
			offense,
			life,
		};
	}

}
