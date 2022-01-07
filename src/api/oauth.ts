/*
 * oauth.ts
 * Created on Fri Jan 07 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import { Router, Request, Response } from 'express';
import { Connection, getConnection } from 'typeorm';
import got from 'got';
import qs from 'querystring';
import { User } from '../entity/user';

const router = Router();
const config = require('./config.json');

router.get('/authorize', async (req: Request, res: Response) => {
	const connection = getConnection() as Connection;
	const code = req.query.code as string;
	let gr: any = await got.post(`https://discordapp.com/api/oauth2/token`, {
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

	gr = await got.get(`https://discordapp.com/api/users/@me`, {
		headers: {
			authorization: `Bearer ${body.access_token}`,
		},
	});

	const uinfo = JSON.parse(gr.body);
	const userRepo = connection.getRepository(User);
	const tmp = await userRepo.findOne({ uid: uinfo.id });
	if ( tmp ) {
		tmp.access_token = body.access_token;
		tmp.expires_in = body.expires_in;
		tmp.refresh_token = body.refresh_token;
		await userRepo.update({ _id: tmp._id }, tmp);
		res.json(tmp);
	} else {
		const user = new User();
		user.uid = uinfo.id;
		user.access_token = body.access_token;
		user.expires_in = body.expires_in;
		user.refresh_token = body.refresh_token;
		await userRepo.save(user);
		res.json(user);
	}
	
	res.end();
});

export default router;
