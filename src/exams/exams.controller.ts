import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { Exam } from './entities/exam.entity';

@ApiTags('Экзамены')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}
  logger = new Logger('Exams');

  @Post()
  @ApiOperation({ summary: 'Создание экзамена' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async create(@Body() createExamDto: CreateExamDto): Promise<Exam> {
    const exam = await this.examsService.create(createExamDto);
    this.logger.debug(
      `Создан новый экзамен: ${exam.discipline}, Группа - ${exam.group.name}, Куратор - ${exam.curator.last_name}`,
    );
    return exam;
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех экзаменов' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async findAll(): Promise<Exam[]> {
    this.logger.debug('Пользователь получил список всех экзаменов');
    return await this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(+id, updateExamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить экзамен' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.examsService.remove(id);
    this.logger.debug(`Экзамен с ID ${id} был удален`);
    return { message: `Экзамен с ID ${id} был удален` };
  }
}
