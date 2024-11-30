import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './createStudent.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
