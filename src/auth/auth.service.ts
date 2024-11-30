import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from './roles.enum';
import { EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from 'src/admin/entity/admin.entity';
import { Student } from 'src/student/entity/student.entity';
import { Curator } from 'src/curator/entities/curator.entity';
import { LoginDto } from './dto/login.dto';

export type JwtPayload = {
  sub: string;
  username: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly entityManager: EntityManager,
  ) {}

  async validateUser(
    login: string,
    pass: string,
  ): Promise<{ role: Role; payload: JwtPayload } | null> {
    const userEntities = [
      { entity: Admin, role: Role.ADMIN },
      { entity: Curator, role: Role.CURATOR },
      { entity: Student, role: Role.STUDENT },
    ];

    for (const { entity, role } of userEntities) {
      const user = await this.entityManager.findOne(entity, {
        where: { login },
        select: ['id', 'login', 'password'],
      });

      if (user) {
        // Используем bcrypt для сравнения паролей
        const isPasswordValid = pass === user.password;

        if (isPasswordValid) {
          return {
            role,
            payload: {
              sub: user.id,
              username: user.login,
              role,
            },
          };
        }
      }
    }

    return null;
  }

  async login(dto: LoginDto): Promise<{ role: Role; access_token: string }> {
    const userData = await this.validateUser(dto.login, dto.password);
    if (!userData) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const access_token = this.jwtService.sign(userData.payload);
    return {
      access_token,
      role: userData.role,
    };
  }
}
