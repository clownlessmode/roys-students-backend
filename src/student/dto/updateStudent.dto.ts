import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './createStudent.dto';
import { Gender } from '../entity/gender.enum';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiProperty({ example: 'male', enum: Gender, nullable: true })
  @IsOptional()
  @IsString({ message: 'Пол должен быть строкой' })
  gender?: Gender;

  @ApiProperty({ example: '2000-01-01', nullable: true })
  @IsOptional()
  @IsDate({ message: 'Дата рождения должна быть корректной датой' })
  @Type(() => Date) // Ensures data type transformation
  birthdate?: Date;

  @ApiProperty({ example: '123-456-789 00', nullable: true })
  @IsOptional()
  @IsString({ message: 'СНИЛС должен быть строкой' })
  snils?: string;

  @ApiProperty({ example: '1234 567890', nullable: true })
  @IsOptional()
  @IsString({ message: 'Паспорт должен быть строкой' })
  passport?: string;
}
