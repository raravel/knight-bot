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
    MessageEmbed,
} from 'discord.js';
import {
    charactor,
    charactorGems,
    charactorAccessory,
    charactorWeapon,
    charactorSkills,
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
    hide: boolean;
    usage: string;
    description: string;
}

const commands: CommandObject[] = [
	charactor,
	charactorGems,
    charactorAccessory,
    charactorWeapon,
    charactorSkills,
	conch,
	{
		command: '승인',
        hide: true,
        usage: '승인 [디스코드 이름]',
        description: '수동으로 길드원 역할을 부여합니다.',
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
        hide: false,
        usage: '주사위',
        description: '1 부터 100가지의 수 중 하나를 랜덤하게 뽑습니다.',
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
        hide: true,
        usage: '청소 [#청소 텍스트 채널 멘션]',
        description: '텍스트채널의 최근 메시지 30개를 제거합니다.',
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
    {
        command: '명령어',
        hide: false,
        usage: '명령어',
        description: '사용 가능한 명령어 목록을 불러옵니다.',
        permission: null,
        async run(cmd: CommandMessage, client: Client) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`사용 가능한 명령어 목록`)
                .setDescription('모든 명령어 앞에는 **.** 을 붙여야 합니다.')
                .addFields(commands.filter((c) => !c.hide).map((command) => ({
                    name: command.usage,
                    value: command.description,
                })));

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        }
    }
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
