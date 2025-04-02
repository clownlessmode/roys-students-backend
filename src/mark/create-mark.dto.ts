import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateMarkDto {
  @ApiProperty({ example: 5 })
  @IsString({ message: 'Оценка должна быть строкой' })
  mark: string;

  @ApiProperty({ example: 'UUID экзамена' })
  @IsUUID('4', { message: 'ID экзамена должно быть UUID' })
  @IsNotEmpty({ message: 'ID экзамена не может быть пустым' })
  examId: string;

  @ApiProperty({ example: 'UUID студента' })
  @IsUUID('4', { message: 'ID студента должно быть UUID' })
  @IsNotEmpty({ message: 'ID студента не может быть пустым' })
  studentId: string;
}
