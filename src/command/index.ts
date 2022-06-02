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
import {
    charactor,
    charactorGems,
    charactorAccessory,
    charactorWeapon,
} from './search';
import conch from './magic-conch';
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
	message: Message,
}
export type CommandFunction = (cmd: CommandMessage, client: Client) => string|Promise<string>;
export interface CommandObject {
	command: string;
	permission: any;
	run: CommandFunction;
}

const commands: CommandObject[] = [
	charactor,
	charactorGems,
    charactorAccessory,
    charactorWeapon,
	conch,
	{
		command: '승인',
		permission: null,
		async run(cmd: CommandMessage, client: Client) {
			const guild = cmd.author?.guild as Guild;
			const member = findMemberFromGuild(guild, 'displayName', cmd.args[0]);
			const ret = await joinMember(member, true);
			if ( ret.result ) {
				const channel = findChannelFromGuild(guild, '조화의광장') as TextChannel;
				await channel.send({ content: `<@${member.user.id}>님이 함께하게 되었습니다. 다같이 환영해 주세요.` });
				return `<@${member.user.id}>님의 가입이 승인되었습니다.`;
			} else {
				return `<@${member.user.id}>님. ${ret.detail}`;
			}
		},
	},
	{
		command: '주사위',
		permission: null,
		run(cmd: CommandMessage, client: Client) {
			const num = Math.floor(Math.random() * 100)+1;
			let ret = `<@${cmd?.author?.user.id}>님의 주사위는 **${num}**입니다.`;

			if ( num === 1 ) {
				ret += ' 주사위 운이 망했네요.';
			} else if ( num === 100 ) {
				ret += ' 강화 붙을 운을 여기다 써버렸네요.';
			}

			return ret;
		},
	},
	{
		command: '청소',
		permission: null,
		async run(cmd: CommandMessage, client: Client) {
			for ( const channel of cmd.message.mentions.channels.values() ) {
				if ( channel.type === 'GUILD_TEXT' ) {
					await cmd.message.channel.send({ content: `<#${channel.id}>의 최근 메시지 30개를 삭제합니다.` });
					const messages = await (channel as TextChannel).messages.fetch({ limit: 30 });
					for ( const msg of messages.values() ) {
						await msg.delete();
					}
				} else {
					await cmd.message.channel.send({ content: `<#${channel.id}>는 텍스트 채널이 아닙니다.` });
				}
			}
			return '청소가 전부 끝났습니다.';
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
		message,
	};
	if ( message.content.startsWith('.') ) {
		cmd.raw = message.content;
		const m = cmd.raw.match(/\.(\S+)\s*(.*)/);
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
	console.log('processor find command', command);
	if ( command ) {
		return await command.run(cmd, client);
	}
}
