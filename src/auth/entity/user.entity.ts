// src/auth/entities/user.entity.ts
import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  TableInheritance,
} from 'typeorm';
import { Role } from '../roles.enum';
import { DefaultEntity } from 'common/entities/default.entity';

@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export abstract class User extends DefaultEntity {
  @Column({ unique: true })
  login: string;

  @Column({ select: true })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;
}
