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
	itemLevel: number;
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
		const itemLevel = parseFloat($('.level-info2__item').text().match(/Lv\.([0-9,.]*)/)?.[1].replace(',', '') as string) || 0;
		const clan = $($('.game-info__guild').children()[1]).text();

		return {
			name,
			clan,
			itemLevel,
		};
	}

}
