import { Client, Intents } from 'discord.js';
import { LarkApi } from './lark-api';

console.log(Intents);
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] });

const larkApi = new LarkApi();

client.on('ready', function() {
	console.log(`Logged in as ${client?.user?.tag}!`);
	console.log(client.guilds);
});

client.on('debug', function(info) {
	console.log('debug log', info);
});

client.on('messageCreate', function(message) {
	switch ( message.type ) {
		case 'GUILD_MEMBER_JOIN':
			break;
		case 'DEFAULT':
		default:
			if ( message.content === 't' ) {
				larkApi.getUser('귀여운라라벨');
			}
			console.log('recive message', message);
	}
});

client.login(process.env.BOT_TOKEN);
