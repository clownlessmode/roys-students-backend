import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: 'ID группы' })
  @IsUUID('4', { message: 'ID группы должно быть UUID' })
  @IsNotEmpty({ message: 'ID группы не может быть пустым' })
  group_id: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Семестр не может быть пустым' })
  semester: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Курс не может быть пустым' })
  course: number;

  @ApiProperty({ example: 'Математика' })
  @IsString({ message: 'Дисциплина должна быть строкой' })
  @IsNotEmpty({ message: 'Дисциплина не может быть пустой' })
  discipline: string;

  @ApiProperty({ example: 'ID куратора' })
  @IsUUID('4', { message: 'ID куратора должно быть UUID' })
  @IsNotEmpty({ message: 'ID куратора не может быть пустым' })
  curator_id: string;

  @ApiProperty({
    example: '2024-03-20T10:00:00Z',
    description: 'Дата проведения экзамена',
    type: String,
    format: 'date-time',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Поле должно быть датой' })
  @IsNotEmpty({ message: 'Дата проведения экзамена не может быть пустой' })
  holding_date: Date;
}
