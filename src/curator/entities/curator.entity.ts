import { User } from 'src/auth/entity/user.entity';
import { Role } from 'src/auth/roles.enum';
import { Entity, Column } from 'typeorm';

@Entity()
export class Curator extends User {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  patronymic: string;

  constructor() {
    super();
    this.role = Role.CURATOR;
  }
}
