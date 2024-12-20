import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Student } from './entity/student.entity';
import { CreateStudentDto } from './dto/createStudent.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateStudentDto } from './dto/updateStudent.dto';
@ApiTags('Студенты')
@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  logger = new Logger('Students');

  @Get('me')
  @ApiOperation({ summary: 'Получить данные текущего студента' })
  @Roles(Role.STUDENT)
  async getMe(@Req() req): Promise<Student> {
    this.logger.debug(req.user);
    const studentId = req.user.userId; // Извлекаем ID студента из JWT
    return this.studentService.findOne(studentId);
  }

  @Get('/bycurator/curator')
  @ApiOperation({ summary: 'Получить данные студентов по id преподавателя' })
  @Roles(Role.CURATOR)
  async getByCurator(@Req() req): Promise<Student[]> {
    this.logger.debug(req.user);
    const curatorId = req.user.userId; // Извлекаем ID студента из JWT
    return this.studentService.getBuCurator(curatorId);
  }

  @Post()
  @ApiOperation({ summary: 'Добавление студента' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async create(@Body() dto: CreateStudentDto): Promise<Student> {
    const student = await this.studentService.create(dto);
    this.logger.debug(
      `Преподавателем создан новый студент: ${student.first_name} ${student.last_name} ${student.patronymic}, Группа - ${student.group.name}`,
    );
    return student;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить определенного студента по id' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async findOne(@Param('id') id: string): Promise<Student> {
    const student = await this.studentService.findOne(id);
    this.logger.debug(
      `Пользователь получил студента: ${student.first_name}, ${student.last_name}, ${student.patronymic},  (ID: ${id})`,
    );
    return student;
  }

  @Get('telegram/:id')
  @ApiOperation({ summary: 'Получить определенного студента по telegram id' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async findOneByTelegram(@Param('id') id: number): Promise<Student> {
    const student = await this.studentService.findByTelegram(id);
    this.logger.debug(
      `Пользователь получил студента: ${student.first_name} ${student.last_name} ${student.patronymic}  (TG ID: ${id})`,
    );
    return student;
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех студентов' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async findMany(): Promise<Student[]> {
    const student = await this.studentService.findMany();
    this.logger.debug(`Пользователь получил всех студентов`);
    return student;
  }

  @Get('by/:names')
  @ApiOperation({ summary: 'Получить студента по ФИО' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async findByNames(@Param('names') names: string): Promise<Student> {
    const student = await this.studentService.findByNames(names);
    this.logger.debug(
      `Пользователь получил студента: ${student.first_name} ${student.last_name} ${student.patronymic}`,
    );
    return student;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CURATOR, Role.STUDENT)
  @ApiOperation({ summary: 'Обновить студента по ID' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return await this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить студента по ID' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.studentService.remove(id);
    this.logger.debug(`Студент с ID ${id} был удален`);
    return { message: `Студент с ID ${id} был удален` };
  }
}
