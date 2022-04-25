import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity('incident')
export class Incident {

	@ObjectIdColumn()
	_id!: number;

	@PrimaryColumn()
	id!: string;

	@Column()
	title: string = '';

	@Column()
	link: string = '';

};

