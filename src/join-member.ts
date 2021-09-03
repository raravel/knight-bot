/*
 * join-member.ts
 * Created on Fri Sep 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { Role } from 'discord.js';
import { LarkApi } from './lark-api';
import { GuildMember } from 'discord.js';

const CLAN_NAME = '기사학원';

const larkApi = new LarkApi();

export default async function(member: GuildMember): Promise<{ data: GuildMember|null, result: boolean, detail: string }> {
	const guild = member.guild;

	console.log(`[${member.user.id}] ${member.nickname} 가입 시도`);

	for ( const m of guild.members.cache.values() ) {
		if ( m.user.id !== member.user.id && m.nickname === member.nickname) {
			return {
				data: null,
				result: false,
				detail: '이미 가입된 멤버와 중복됩니다. 닉네임을 확인해 주세요.',
			};
		}
	}

	if ( member.roles.cache.find((role) => role.name === '길드원') ) {
		return {
			data: null,
			result: false,
			detail: '이미 길드원 역할이 부여된 멤버입니다.',
		};
	}

	const user = await larkApi.getUser(member.nickname as string);
	if ( user.itemLevel === 0 ) {
		return {
			data: null,
			result: false,
			detail: '전투정보실 검색에 실패했습니다. 닉네임을 확인해 주세요.',
		};
	}

	if ( user.clan === CLAN_NAME || user.clan === '인생이그것임' ) {
		const memberRole = guild.roles.cache.find((role) => role.name === '길드원') as Role;
		return {
			detail: 'success',
			result: true,
			data: await member.roles.add(memberRole),
		};
	}

	return {
		detail: `전투정보실에 기록된 길드 이름이 다릅니다. [${user.clan}] 갱신되길 기다려주세요.`,
		result: false,
		data: null,
	};
}
