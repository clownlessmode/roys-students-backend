import { User } from 'src/auth/entity/user.entity';
import { Role } from 'src/auth/roles.enum';
import { Exam } from 'src/exams/entities/exam.entity';
import { Group } from 'src/group/entity/group.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class Curator extends User {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  patronymic: string;

  @OneToMany(() => Group, (group) => group.curator)
  groups: Group[];

  @OneToMany(() => Exam, (exam) => exam.curator)
  exams: Exam[];

  constructor() {
    super();
    this.role = Role.CURATOR;
  }
}
