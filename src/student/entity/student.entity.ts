// src/auth/entities/student.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Group } from 'src/group/entity/group.entity';
import { Telegram } from './telegram.entity';
import { Role } from 'src/auth/roles.enum';
import { User } from 'src/auth/entity/user.entity';
import { Gender } from './gender.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Student extends User {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  patronymic: string;

  @Column({ nullable: true })
  gender: Gender | null;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    example: '2024-09-21T12:34:56.789Z',
  })
  birthdate: Date | null;

  @Column({ nullable: true })
  snils: string | null;

  @Column({ nullable: true })
  passport: string | null;

  @ManyToOne(() => Group, (group) => group.students, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToOne(() => Telegram, (telegram) => telegram.id, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  telegram?: Telegram;

  constructor() {
    super();
    this.role = Role.STUDENT;
  }
}
