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

export default async function(member: GuildMember, force: boolean = false): Promise<{ data: GuildMember|null, result: boolean, detail: string }> {
	const guild = member.guild;

	console.log(`[${member.user.id}] ${member.nickname} 가입 시도`);

	if ( member.roles.cache.find((role) => role.name === '길드원') ) {
		return {
			data: null,
			result: false,
			detail: '이미 길드원 역할이 부여된 멤버입니다.',
		};
	}

	/*
	 * TODO: 이 부분은 버그가 많아 수정이 필요함.
	for ( const m of guild.members.cache.values() ) {
		if ( m.user.id !== member.user.id && m.nickname === member.nickname) {
			return {
				data: null,
				result: false,
				detail: '이미 가입된 멤버와 중복됩니다. 닉네임을 확인해 주세요.',
			};
		}
	}
	*/

	const user = await larkApi.getUser(member.nickname as string);
	if ( force ) {
		const memberRole = guild.roles.cache.find((role) => role.name === '길드원') as Role;
		return {
			detail: 'success',
			result: true,
			data: await member.roles.add(memberRole),
		};
	} else {
		if ( user.itemLevel === 0 ) {
			return {
				data: null,
				result: false,
				detail: '전투정보실 검색에 실패했습니다. 닉네임을 확인해 주세요.',
			};
		}

		if ( user.clan === CLAN_NAME ) {
			const memberRole = guild.roles.cache.find((role) => role.name === '길드원') as Role;
			const serverRole = guild.roles.cache.find((role) => role.name === user.server) as Role;
			await member.roles.add(serverRole);
			await member.roles.add(memberRole);
			return {
				detail: 'success',
				result: true,
				data: member,
			};
		}
	}

	return {
		detail: `전투정보실에 기록된 길드 이름이 다릅니다. [${user.clan}] 갱신되길 기다려주세요.`,
		result: false,
		data: null,
	};
}
