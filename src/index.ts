import {
	Client,
	Intents,
	Role,
	MessageActionRow,
	MessageButton,
	TextChannel,
	GuildMember,
} from 'discord.js';
import { LarkApi } from './lark-api';
import joinMember from './join-member';
import {
	readChat,
	isClanMember,
	findGuildAndChannel,
} from './common/';
import { cmdParse, processor } from './command/';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
	],
});

const larkApi = new LarkApi();

const CLAN_NAME = '기사학원';

function isJoinComponent(component: MessageActionRow) {
	if ( component.type === 'ACTION_ROW' ) {
		return component.components[0]?.customId === 'sign-account';
	}
	return false;
}

client.on('ready', async function() {
	console.log(`Logged in as ${client?.user?.tag}!`);
	const channel: TextChannel = findGuildAndChannel(client, CLAN_NAME, '레온하트') as TextChannel;

	const messages = await channel.messages.fetch({ limit: 10 });
	let flag = true;
	for ( const msg of messages.values() ) {
		if ( msg.author.username === 'KnightBot' ) {
			if ( isJoinComponent(msg.components[0]) ) {
				flag = false;
				break;
			}
		}
	}

	if ( flag ) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('sign-account')
					.setLabel('인증하기')
					.setStyle('PRIMARY')
			);
		await channel.send({ content: readChat('join'), components: [ row ] });
	}
});

client.on('debug', function(info) {
	//console.log('debug log', info);
});

client.on('messageCreate', async function(message) {
	switch ( message.type ) {
		case 'GUILD_MEMBER_JOIN':
			break;
		case 'DEFAULT':
		default:
			const cmd = cmdParse(message, client);
			if ( cmd.isCmd ) {
				const ret = await processor(client, cmd);
				if ( ret ) {
					await message.channel.send({ content: ret });
				}
			}
			//console.log('recive message', message);
	}
});

client.on('interactionCreate', async function(interaction) {
	if ( !interaction.isButton() ) return;

	if ( interaction.customId === 'sign-account' ) {
		const member = interaction.member as GuildMember;
		if ( isClanMember(member) ) return;

		const ret = await joinMember(member);
		if ( ret.result ) {
			await interaction.reply(`<@${member.user.id}>님의 가입이 승인되었습니다.`);
			const channel = findGuildAndChannel(client, CLAN_NAME, '조화의광장') as TextChannel;
			await channel.send({ content: `<@${member.user.id}>님이 함께하게 되었습니다. 다같이 환영해 주세요.` });
		} else {
			await interaction.reply({ content: `<@${member.user.id}>님. ${ret.detail}` });
		}
		setTimeout(() => {
			interaction.deleteReply();
		}, 5000);
	}
});

client.login(process.env.BOT_TOKEN);
