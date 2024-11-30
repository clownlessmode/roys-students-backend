import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCuratorDto {
  @ApiProperty({ example: 'Иван' })
  @IsString({ message: 'Имя преподавателя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя преподавателя не может быть пустым' })
  first_name: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString({ message: 'Фамилия преподавателя должно быть строкой' })
  @IsNotEmpty({ message: 'Фамилия преподавателя не может быть пустым' })
  last_name: string;

  @ApiProperty({ example: 'Иванович' })
  @IsString({ message: 'Отчество преподавателя должно быть строкой' })
  @IsNotEmpty({ message: 'Отчество преподавателя не может быть пустым' })
  patronymic: string;

  @ApiProperty({ example: 'curator-dp-21' })
  @IsString({ message: 'Логин преподавателя должнен быть строкой' })
  @IsNotEmpty({ message: 'Логин преподавателя не может быть пустым' })
  login: string;

  @ApiProperty({ example: 'SomePassword_321' })
  @IsString({ message: 'Пароль преподавателя должнен быть строкой' })
  @IsNotEmpty({ message: 'Пароль преподавателя не может быть пустым' })
  password: string;
}
