/*
 * index.ts
 * Created on Mon Sep 06 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import {
	GuildMember,
	Message,
	TextChannel,
	Guild,
	Client,
} from 'discord.js';
import { charactor } from './search';
import joinMember from '../join-member';
import {
	findChannelFromGuild,
	findMemberFromGuild,
	findGuildAndMember,
} from '../common/';

export interface CommandMessage {
	isCmd: boolean;
	content: string;
	command: string;
	args: string[];
	raw: string;
	author?: GuildMember;
}
export type CommandFunction = (cmd: CommandMessage, client: Client) => string|Promise<string>;
export interface CommandObject {
	command: string;
	permission: any;
	run: CommandFunction;
}

const commands: CommandObject[] = [
	charactor,
	{
		command: '승인',
		permission: null,
		async run(cmd: CommandMessage, client: Client) {
			const guild = cmd.author?.guild as Guild;
			const member = findMemberFromGuild(guild, 'displayName', cmd.args[0]);
			const ret = await joinMember(member);
			if ( ret.result ) {
				const channel = findChannelFromGuild(guild, '조화의광장') as TextChannel;
				await channel.send({ content: `<@${member.user.id}>님이 함께하게 되었습니다. 다같이 환영해 주세요.` });
				return `<@${member.user.id}>님의 가입이 승인되었습니다.`;
			} else {
				return `<@${member.user.id}>님. ${ret.detail}`;
			}
		},
	},
];

export function cmdParse(message: Message, client): CommandMessage {
	const cmd: CommandMessage = {
		isCmd: false,
		content: '',
		args: [],
		command: '',
		raw: '',
	};
	if ( message.content.startsWith('.') ) {
		cmd.raw = message.content;
		const m = cmd.raw.match(/\.(\W+)\s+(.*)/);
		if ( m ) {
			cmd.command = m[1];
			cmd.content = m[2];
			cmd.args = m[2].split(/\s+/);
		}
		cmd.isCmd = true;
		cmd.author = findGuildAndMember(client, '기사학원', 'id', message.author.id);
	}
	return cmd;
}

export async function processor(client: Client, cmd: CommandMessage) {
	const command = commands.find(({ command }) => command === cmd.command);
	if ( command ) {
		return await command.run(cmd, client);
	}
}
