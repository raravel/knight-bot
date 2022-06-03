/*
 * index.ts
 * Created on Fri Sep 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import fs from 'fs';
import path from 'path';
import { GuildMember, Client, Guild, Message, User } from 'discord.js';
import { parse as CookieParse } from 'tough-cookie';


export type Json = Record<string, any>;
export const IS_DEV = process.env['NODE_ENV'] === 'development';
export const config = IS_DEV ? require('../../config.dev.json') : require('../../config.json');
export const CLAN_NAME = config['CLAN_NAME'];
export const GUILD_NAME = config['GUILD_NAME'];

export function readChat(type: string, ...args: any[]) {
	let chat = fs.readFileSync(path.join(__dirname,`../chat/${type}.md`), { encoding: 'utf8' });

	args.forEach((arg: any, idx: number) => {
		chat = chat.replaceAll('$' + idx, arg.toString());
	});

	return chat;
}

export function isClanMember(member: GuildMember) {
	return !!member.roles.cache.find((role) => role.name === '길드원');
}

export function findGuild(client: Client, guild: string) {
	return client.guilds.cache.find((g) => g.name === guild);
}

export function findChannelFromGuild(guild: Guild, channel: string) {
	return guild.channels.cache.find((c) => c.name === channel);
}

export function findGuildAndChannel(client: Client, guild: string, channel: string) {
	return findChannelFromGuild(findGuild(client, guild) as Guild, channel);
}

export function findMemberFromGuild(guild: Guild, key: string, val: any) {
	return guild.members.cache.find((m) => m[key] === val) as GuildMember;
}

export function findGuildAndMember(client: Client, guild: string, key: string, val: any) {
	return findMemberFromGuild(findGuild(client, guild) as Guild, key, val);
}

export function cooker(cookie: any) {
	const cook: Json = {};
	let cookies: any = [];
	if ( cookie instanceof Array) {
		cookies = cookie.map((c) => CookieParse(c).toJSON());
	} else {
		if ( cookie ) {
			cookies = [ CookieParse(cookie).toJSON() ];
		}
	}

	cookies.forEach((ck: Json) => {
		cook[ck.key as string] = {
			value: ck.value,
			domain: ck.domain,
		};
	});
	return cook;
}

export function getMemberName(member: GuildMember) {
    return member.nickname || member.user.username;
}
