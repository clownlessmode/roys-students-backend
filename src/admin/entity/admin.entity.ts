import { DefaultEntity } from 'common/entities/default.entity';
import { User } from 'src/auth/entity/user.entity';
import { Role } from 'src/auth/roles.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
@Entity()
export class Admin extends User {
  constructor() {
    super();
    this.role = Role.ADMIN;
  }
}
