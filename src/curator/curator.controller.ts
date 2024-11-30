import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CuratorService } from './curator.service';
import { CreateCuratorDto } from './dto/create-curator.dto';
import { UpdateCuratorDto } from './dto/update-curator.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Curator } from './entities/curator.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Преподаватели')
@Controller('curator')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CuratorController {
  constructor(private readonly curatorService: CuratorService) {}
  private readonly logger = new Logger('CuratorController');

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Добавление преподавателя' })
  async create(@Body() dto: CreateCuratorDto): Promise<Curator> {
    const curator = await this.curatorService.create(dto);
    this.logger.debug(
      `Администратором создан новый преподаватель: ${curator.first_name} ${curator.last_name} ${curator.patronymic}`,
    );
    return curator;
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Получить всех преподавателей',
  })
  async findMany(): Promise<Curator[]> {
    return await this.curatorService.findMany();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Получить преподавателя по ID',
  })
  async findOne(@Param('id') id: string): Promise<Curator> {
    try {
      return await this.curatorService.findOne(id);
    } catch (error) {
      this.logger.error(`Преподаватель с ID ${id} не найден`);
      throw new NotFoundException(`Преподаватель с ID ${id} не найден`);
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить преподавателя по ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCuratorDto: UpdateCuratorDto,
  ): Promise<Curator> {
    return await this.curatorService.update(id, updateCuratorDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить преподавателя по ID' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.curatorService.remove(id);
    this.logger.debug(`Преподаватель с ID ${id} был удален`);
    return { message: `Преподаватель с ID ${id} успешно удален` };
  }
}
