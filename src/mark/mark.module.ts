import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarkService } from './mark.service';
import { MarkController } from './mark.controller';
import { Student } from 'src/student/entity/student.entity';
import { Mark } from './entity/mark.entity';
import { Exam } from 'src/exams/entities/exam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mark, Exam, Student])],
  providers: [MarkService],
  controllers: [MarkController],
})
export class MarkModule {}
