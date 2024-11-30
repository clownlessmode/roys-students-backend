import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { Strategy } from 'passport-local';
import { Role } from './roles.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super(); // Ожидает поля 'username' и 'password' в теле запроса
  }

  async validate(
    username: string,
    password: string,
  ): Promise<{ role: Role; payload: JwtPayload }> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Неверные логин или пароль');
    }
    return user;
  }
}
