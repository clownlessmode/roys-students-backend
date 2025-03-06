import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { MarkService } from './mark.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateMarkDto } from './create-mark.dto';
import { Mark } from './entity/mark.entity';

@ApiTags('Оценки')
@Controller('mark')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarkController {
  constructor(private readonly marksService: MarkService) {}
  logger = new Logger('Marks');

  @Post()
  @ApiOperation({ summary: 'Добавить оценку студенту за экзамен/зачет' })
  @Roles(Role.ADMIN, Role.CURATOR)
  async create(@Body() dto: CreateMarkDto): Promise<Mark> {
    const mark = await this.marksService.create(dto);
    this.logger.debug(
      `Оценка ${mark.mark} добавлена студенту ${mark.student.last_name} за экзамен ${mark.exam.discipline}`,
    );
    return mark;
  }
}
