import { DefaultEntity } from 'common/entities/default.entity';
import { Curator } from 'src/curator/entities/curator.entity';
import { Student } from 'src/student/entity/student.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
@Entity()
export class Group extends DefaultEntity {
  @Column()
  name: string;

  @JoinColumn()
  @OneToOne(() => Curator, (curator) => curator.id, {
    eager: true,
  })
  curator: Curator;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];
}
