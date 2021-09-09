/*
 * search.ts
 * Created on Mon Sep 06 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { CommandMessage, CommandObject } from '.';
import { LarkApi } from '../lark-api';

const larkApi = new LarkApi();

export const charactor: CommandObject = {
	command: '정보',
	permission: null,
	async run(cmd: CommandMessage, client) {
		const user = await larkApi.getUser(cmd.content);
		let ret = '';
		ret += '```css\n';
		ret += `[${user.name}] (${user.server}) ${user.class}\n`;
		ret += `전투 Lv. ${user.level}\n`;
		ret += `원정대 Lv. ${user.expLevel}\n`;
		ret += `아이템 Lv. ${user.itemLevel}\n`;
		ret += `공격력: ${user.offense}\n`;
		ret += `생명력: ${user.life}\n`;
		ret += `길드 '${user.clan}'\n`;
		ret += '```\n';

		ret += '```css\n';
		ret += user.battle.map((battle) => `${battle.text}: ${battle.value}`).join('\n');
		ret += '```\n';

		ret += '```css\n';
		ret += user.engrave.map((engrave) => `${engrave.text}: ${engrave.value}`).join('\n');
		ret += '```\n';

		return ret;
	},
};
