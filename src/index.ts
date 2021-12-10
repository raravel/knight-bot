import {
	Client,
	Intents,
	Role,
	MessageActionRow,
	MessageButton,
	TextChannel,
	GuildMember,
	VoiceChannel,
	CategoryChannel,
} from 'discord.js';
import { LarkApi } from './lark-api';
import joinMember from './join-member';
import {
	readChat,
	isClanMember,
	findGuildAndChannel,
	findGuild,
} from './common/';
import { cmdParse, processor } from './command/';

const client = new Client({
	intents: [
		...Object.values(Intents.FLAGS),
	],
});

const larkApi = new LarkApi();

(async () => {
	larkApi.getUser('귀여운라라벨');
})();


if ( 1 ) {
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
			)
			.addComponents(
				new MessageButton()
					.setCustomId('sign-guest')
					.setLabel('저는 손님입니다.')
					.setStyle('SECONDARY')
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
			//console.log('recive message', message, cmd);
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
	} else if ( interaction.customId === 'sign-guest' ) {
		const member = interaction.member as GuildMember;
		const guild = member.guild;

		console.log(`[${member.user.id}] ${member.nickname} 손님으로 가입 시도`);

		if ( member.roles.cache.find((role) => role.name === '손님' || role.name === '길드원') ) {
			await interaction.reply({ content: `<@${member.user.id}>님. 이미 손님 역할이 부여된 멤버입니다.` });
		} else {
			if ( member.nickname === null ) {
				await interaction.reply({ content: `<@${member.user.id}>님. 서버 프로필 변경에서 닉네임을 변경해 주세요.` });
			} else {
				const memberRole = guild.roles.cache.find((role) => role.name === '손님') as Role;
				await member.roles.add(memberRole),

				await interaction.reply(`<@${member.user.id}>님에게 손님역할이 부여되었습니다.`);
				const channel = findGuildAndChannel(client, CLAN_NAME, '네리아주점') as TextChannel;
				await channel.send({ content: `<@${member.user.id}>님 반갑습니다.` });
			}
		}
		setTimeout(() => {
			interaction.deleteReply();
		}, 5000);
	}
});

client.on('voiceStateUpdate', async function(oldState, newState) {
	const channel = newState.channel;
	const member = newState.member as GuildMember;
	const guild = member.guild;
	if ( channel ) {
		if ( channel.id === '882935484144287754' ) {
			// 모험가 쉼터
			const restRole = guild.roles.cache.find((role) => role.name === '쉬는중') as Role;
			await member.roles.add(restRole);
		} else if ( channel.id === '918698962880434257' ) {
			// 공격대 생성
			const name = `${member.nickname}님의_공격대`;
			const c = await channel.parent?.createChannel(name, {
				type: 'GUILD_VOICE',
				permissionOverwrites: [
					{
						id: member.id,
					},
				],
				position: channel.parent?.children.size+1,
			});
			if ( c ) {
				await member.voice.setChannel(c as VoiceChannel);
			}
		} else if ( channel.parent?.id === '918694375976996885' ) {
			// 기사단 카테고리
		}
	} else {
		// exit void channel
		if ( oldState.channelId === '882935484144287754' ) {
			// 모험가 쉼터
			const restRole = guild.roles.cache.find((role) => role.name === '쉬는중') as Role;
			await member.roles.remove(restRole);
		}
	}
});

setInterval(() => {
	console.log('Check empty voice channel in raid category.');
	const category = findGuildAndChannel(client, CLAN_NAME, '기사단') as CategoryChannel;
	category.children.each((channel) => {
		if ( channel.id !== '918698962880434257' && channel.type === 'GUILD_VOICE' ) {
			// 생성된 공격대 음성 채널만 검사
			if ( (channel as VoiceChannel).members.size <= 0 ) {
				channel.delete('Empty people in voice channel');
			}
		}
	});
}, 1000 * 60);

client.login(process.env.BOT_TOKEN);
}
