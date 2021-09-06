/*
 * index.ts
 * Created on Mon Sep 06 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { User, Message } from 'discord.js';
import { charactor } from './search';

export interface CommandMessage {
	isCmd: boolean;
	content: string;
	command: string;
	args: string[];
	raw: string;
	author: User|null;
}
export type CommandFunction = (cmd: CommandMessage) => string|Promise<string>;
export interface CommandObject {
	command: string;
	permission: any;
	run: CommandFunction;
}

const commands: CommandObject[] = [
	charactor,
];

export function cmdParse(message: Message): CommandMessage {
	const cmd: CommandMessage = {
		isCmd: false,
		content: '',
		args: [],
		command: '',
		raw: '',
		author: null,
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
		cmd.author = message.author;
	}
	return cmd;
}

export async function processor(cmd: CommandMessage) {
	const command = commands.find(({ command }) => command === cmd.command);
	if ( command ) {
		return await command.run(cmd);
	}
}
