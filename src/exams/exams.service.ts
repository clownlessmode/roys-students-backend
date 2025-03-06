import { Injectable } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './entities/exam.entity';
import { GroupService } from 'src/group/group.service';
import { CuratorService } from 'src/curator/curator.service';
import { EntityManager } from 'typeorm';
import { ExamEnum } from './enums/exam.enum';

@Injectable()
export class ExamsService {
  constructor(
    private manager: EntityManager,
    private groupService: GroupService,
    private curatorService: CuratorService,
  ) {}
  async create(dto: CreateExamDto): Promise<Exam> {
    const group = await this.groupService.findOne(dto.group_id);
    const curator = await this.curatorService.findOne(dto.curator_id);

    const exam = await this.manager.create(Exam, {
      type: dto.type,
      semester: dto.semester,
      course: dto.course,
      discipline: dto.discipline,
      group: group,
      curator: curator,
      holding_date: dto.holding_date,
    });

    return await this.manager.save(Exam, exam);
  }

  async findAll(type: ExamEnum): Promise<Exam[]> {
    return await this.manager.find(Exam, {
      where: { type },
      relations: {
        group: true,
        curator: true,
      },
    });
  }

  async findOne(id: string): Promise<Exam> {
    return await this.manager.findOneOrFail(Exam, {
      where: { id },
      relations: {
        group: true,
        curator: true,
      },
    });
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    return `This action updates a #${id} exam`;
  }

  async remove(id: string): Promise<void> {
    const exam = await this.findOne(id);
    await this.manager.remove(Exam, exam);
  }
}
