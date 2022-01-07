/*
 * oauth.ts
 * Created on Fri Jan 07 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { Router, Request, Response } from 'express';
import got from 'got';
import qs from 'querystring';

const router = Router();
const config = require('./config.json');

router.get('/authorize', async (req: Request, res: Response) => {
	const code = req.query.code as string;
	try {
	const gr = await got.post(`https://discordapp.com/api/oauth2/token`, {
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		body: qs.encode({
			client_id: config.discord.id,
			client_secret: config.discord.secret,
			grant_type: 'authorization_code',
			code,
		}),
	});

	const body = JSON.parse(gr.body);
	res.json(body);
	} catch(err) {
		console.error(err);
	}
});

router.get('/guilds', (req: Request, res: Response) => {
	res.send('done!');
});

export default router;
