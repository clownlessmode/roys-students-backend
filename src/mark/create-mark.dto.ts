import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateMarkDto {
  @ApiProperty({ example: 5 })
  @IsInt({ message: 'Оценка должна быть целым числом' })
  @Min(2, { message: 'Минимальная оценка — 2' })
  @Max(5, { message: 'Максимальная оценка — 5' })
  mark: number;

  @ApiProperty({ example: 'UUID экзамена' })
  @IsUUID('4', { message: 'ID экзамена должно быть UUID' })
  @IsNotEmpty({ message: 'ID экзамена не может быть пустым' })
  examID: string;

  @ApiProperty({ example: 'UUID студента' })
  @IsUUID('4', { message: 'ID студента должно быть UUID' })
  @IsNotEmpty({ message: 'ID студента не может быть пустым' })
  studentId: string;
}
