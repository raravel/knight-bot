/*
 * search.ts
 * Created on Mon Sep 06 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { CommandMessage, CommandObject } from '.';
import { LarkApi } from '../lark-api';
import { MessageEmbed, Client } from 'discord.js';

const larkApi = new LarkApi();

export const charactor: CommandObject = {
	command: '정보',
	permission: null,
    hide: false,
    usage: '정보 [로스트아크 캐릭터 이름]',
    description: '캐릭터의 기본 정보를 불러옵니다.',
	async run(cmd: CommandMessage, client: Client) {
		const user = await larkApi.getUser(cmd.content);

        if ( !Number.isNaN(user.life) ) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`${user.name}님의 정보`)
                .addField(
                    '기본 정보',
                    `서버: ${user.server}\n` +
                        `전투: Lv. ${user.level}\n` +
                        `원정대: Lv. ${user.expLevel}\n` +
                        `아이템: Lv. ${user.itemLevel}`,
                    true
                )
                .addField(
                    '기본 특성',
                    `공격력: ${user.offense}\n` +
                        `최대 생명력: ${user.life}\n`,
                    true
                )
                .addField(
                    '길드',
                    '```yaml\n'+
                        user.clan + '\n'+
                        '```',
                    true
                )
                .addField('\u200B', '\u200B')
                .addField(
                    '전투 특성',
                    user.battle
                    .map(({ text, value }) => `${text} +${value}`)
                    .join('\n'),
                    true
                )
                .addField('\u200B', '\u200B', true)
                .addField(
                    '장착 각인',
                    user.engrave
                    .map(({ text, value }) => `${text} +${value}`)
                    .join('\n'),
                    true
                );

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        } else {
            return `**${cmd.content}** 유저의 정보를 찾을 수 없습니다.`;
        }
	},
};

export const charactorGems: CommandObject = {
    command: '보석',
    permission: null,
    hide: false,
    usage: '보석 [로스트아크 캐릭터 이름]',
    description: '캐릭터의 보석 목록을 불러옵니다.',
    async run(cmd: CommandMessage, client: Client) {
		const user = await larkApi.getUser(cmd.content);

        if ( !Number.isNaN(user.life) ) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`${user.name}님의 보석`)
                .addFields(
                    user.gems.map(({ title, effect }) => ({
                        name: title,
                        value: `[${effect.job}] ${effect.skill} ${effect.description} ${effect.value}% ${effect.description2}`,
                    }))
                );

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        } else {
            return `**${cmd.content}** 유저의 정보를 찾을 수 없습니다.`;
        }
    },
};

export const charactorWeapon: CommandObject = {
    command: '장비',
    permission: null,
    hide: false,
    usage: '장비 [로스트아크 캐릭터 이름]',
    description: '캐릭터의 장비 목록을 불러옵니다.',
    async run(cmd: CommandMessage, client: Client) {
		const user = await larkApi.getUser(cmd.content);

        if ( !Number.isNaN(user.life) ) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`${user.name}님의 장비`)
                .addField(
                    '\u200B',
                    user.weapons.map(({ upgrade, title, quality }) => 
                        `+${upgrade} ${title} (품질: ${quality})`,
                    ).join('\n'),
                );

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        } else {
            return `**${cmd.content}** 유저의 정보를 찾을 수 없습니다.`;
        }
    },
};

export const charactorSkills: CommandObject = {
    command: '스킬',
    permission: null,
    hide: false,
    usage: '스킬 [로스트아크 캐릭터 이름]',
    description: '캐릭터의 사용중인 스킬 목록을 불러옵니다.',
    async run(cmd: CommandMessage, client: Client) {
		const user = await larkApi.getUser(cmd.content);

        if ( !Number.isNaN(user.life) ) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`${user.name}님의 스킬`)
                .addFields(
                    user.skills.map((skill) => ({
                        name: `${skill.title} ${skill.level} ${skill.rune ? `[${skill.rune.name}]` : ''}`,
                        value: skill.tridpods.map((tridpod) => `${tridpod.name} ${tridpod.level}`).join('\n') || '\u200B',
                    }))
                );

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        } else {
            return `**${cmd.content}** 유저의 정보를 찾을 수 없습니다.`;
        }
    },
};

export const charactorAccessory: CommandObject = {
    command: '악세',
    permission: null,
    hide: false,
    usage: '악세 [로스트아크 캐릭터 이름]',
    description: '캐릭터의 장신구 목록을 불러옵니다.',
    async run(cmd: CommandMessage, client: Client) {
		const user = await larkApi.getUser(cmd.content);

        if ( !Number.isNaN(user.life) ) {
            const msg = new MessageEmbed()
                .setColor('#c231c4')
                .setTitle(`${user.name}님의 장신구`)
                .addFields(
                    user.accessories.map((accessory) => ({
                        name: `${accessory.title} +${accessory.quality}`,
                        value: accessory.status.map((s) => `${s.text} +${s.value}`).join(`, `) + '\n'
                            + accessory.engrave.map((e) => `[${e.text}] +${e.value}`).join('\n'),
                    }))
                );

            await cmd.message.channel.send({ embeds: [msg] });
            return '';
        } else {
            return `**${cmd.content}** 유저의 정보를 찾을 수 없습니다.`;
        }
    },
};
