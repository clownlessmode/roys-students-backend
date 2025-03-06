import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateMarkDto } from './create-mark.dto';
import { Mark } from './entity/mark.entity';
import { Exam } from 'src/exams/entities/exam.entity';
import { Student } from 'src/student/entity/student.entity';

@Injectable()
export class MarkService {
  constructor(private manager: EntityManager) {}

  async create(dto: CreateMarkDto): Promise<Mark> {
    const exam = await this.manager.findOne(Exam, {
      where: { id: dto.examId },
    });
    if (!exam) throw new NotFoundException('Экзамен не найден');

    const student = await this.manager.findOne(Student, {
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Студент не найден');

    const mark = await this.manager.create(Mark, {
      mark: dto.mark,
      exam,
      student,
    });
    return await this.manager.save(mark);
  }
}
