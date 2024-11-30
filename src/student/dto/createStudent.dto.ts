import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class CreateStudentDto {
  @ApiProperty({ example: 'Иван' })
  @IsString({ message: 'Имя студента должно быть строкой' })
  @IsNotEmpty({ message: 'Имя студента не может быть пустым' })
  first_name: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString({ message: 'Фамилия студента должно быть строкой' })
  @IsNotEmpty({ message: 'Фамилия студента не может быть пустым' })
  last_name: string;

  @ApiProperty({ example: 'Иванович' })
  @IsString({ message: 'Отчество студента должно быть строкой' })
  @IsNotEmpty({ message: 'Отчество студента не может быть пустым' })
  patronymic: string;

  @ApiProperty({ example: 'uuid-of-group' })
  @IsUUID('4', { message: 'group_id должно быть UUID' })
  @IsNotEmpty({ message: 'Идентификатор группы не может быть пустым' })
  group_id: string;
}
