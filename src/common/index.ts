/*
 * index.ts
 * Created on Fri Sep 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import fs from 'fs';
import path from 'path';
import { GuildMember, Client, Guild, Message, User } from 'discord.js';

export function readChat(type: string) {
	return fs.readFileSync(path.join(__dirname,`../chat/${type}.md`), { encoding: 'utf8' });
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
