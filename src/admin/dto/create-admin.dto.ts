import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    example: 'adminLogin',
    description: 'Логин администратора',
  })
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин не должен быть пустым' })
  readonly login: string;

  @ApiProperty({
    example: 'key',
    description: 'Ключ администратора',
  })
  @ApiProperty({
    example: 'securePassword123',
    description: 'Пароль администратора',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  readonly password: string;
}
