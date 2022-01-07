/*
 * user.ts
 * Created on Fri Jan 07 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class User {

	@ObjectIdColumn()
	_id!: number;

	@PrimaryColumn()
	uid!: string;

	@Column()
	access_token!: string;

	@Column()
	expires_in!: number;

	@Column()
	refresh_token!: string;

}
