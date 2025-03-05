import { DefaultEntity } from 'common/entities/default.entity';
import { Curator } from 'src/curator/entities/curator.entity';
import { Exam } from 'src/exams/entities/exam.entity';
import { Student } from 'src/student/entity/student.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
@Entity()
export class Group extends DefaultEntity {
  @Column()
  name: string;

  @ManyToOne(() => Curator, (curator) => curator.groups, {
    eager: true,
    nullable: false,

    onDelete: 'CASCADE',
  })
  @JoinColumn()
  curator: Curator;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];

  @OneToMany(() => Exam, (exam) => exam.group)
  exams: Exam[];
}
