import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { GroupService } from './group.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './entity/group.entity';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Группы')
@Controller('group')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
  private readonly logger = new Logger('CuratorController');

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Добавление группы' })
  async create(@Body() dto: CreateGroupDto): Promise<Group> {
    const group = await this.groupService.create(dto);
    this.logger.debug(`Администратором создан новая группа: ${group.name}`);
    return group;
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все группы',
  })
  async findMany(): Promise<Group[]> {
    return await this.groupService.findMany();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Получить группу по ID',
  })
  async findOne(@Param('id') id: string): Promise<Group> {
    try {
      return await this.groupService.findOne(id);
    } catch (error) {
      this.logger.error(`Группа с ID ${id} не найден`);
      throw new NotFoundException(`Группа с ID ${id} не найден`);
    }
  }
  @Get('by/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Получить группу по ID',
  })
  async findGroupsByCurator(@Param('id') id: string): Promise<Group[]> {
    try {
      return await this.groupService.findGroupsByCurator(id);
    } catch (error) {
      this.logger.error(`Группа с ID ${id} не найден`);
      throw new NotFoundException(`Группа с ID ${id} не найден`);
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить группу по ID' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return await this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить группу по ID' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.groupService.remove(id);
    this.logger.debug(`Группа с ID ${id} была удалена`);
    return { message: `Группа с ID ${id} была удалена` };
  }
}
