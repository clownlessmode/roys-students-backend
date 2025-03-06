import { Curator } from 'src/curator/entities/curator.entity';
import { Group } from 'src/group/entity/group.entity';
import { ExamEnum } from '../enums/exam.enum';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ExamEnum, nullable: false })
  type: ExamEnum;

  @Column()
  semester: number;

  @Column()
  course: number;

  @Column()
  discipline: string;

  @ManyToOne(() => Group, (group) => group.exams)
  group: Group;

  @ManyToOne(() => Curator, (curator) => curator.exams)
  @JoinColumn({ name: 'curator_id' })
  curator: Curator;

  @Column()
  holding_date: Date;
}
