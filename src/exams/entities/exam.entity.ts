import { Curator } from 'src/curator/entities/curator.entity';
import { Group } from 'src/group/entity/group.entity';
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
}
