import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    // Установка куки
    response.cookie('access_token', result.access_token, {
      httpOnly: true, // куки недоступны из JavaScript
      secure: process.env.NODE_ENV === 'production', // только для HTTPS в продакшене
      sameSite: 'strict', // защита от CSRF
      path: '/', // доступно для всех путей
      maxAge: 365 * 24 * 60 * 60 * 1000, // время жизни куки (например, 24 часа)
    });

    return result;
  }
}
