import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class Flag {

	@ObjectIdColumn()
	_id!: number;

	@PrimaryColumn()
	uid!: string;

	@Column()
	pub: number = 0;

	@Column()
	shelter: number = 0;

};
