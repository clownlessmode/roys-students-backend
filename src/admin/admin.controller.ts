// src/admin/admin.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { Admin } from './entity/admin.entity';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(ApiKeyGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * Создание нового администратора
   * POST /admin
   * Тело запроса:
   * {
   *   "login": "admin2",
   *   "password": "password456"
   * }
   */
  @Post()
  @ApiSecurity('x-api-key') // Использование схемы безопасности API Key
  @ApiOperation({ summary: 'Создание нового администратора' })
  @ApiResponse({
    status: 201,
    description: 'Администратор успешно создан.',
    type: Admin,
  })
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
    this.logger.log(
      `Создание администратора с логином: ${createAdminDto.login}`,
    );
    const admin = await this.adminService.createAdmin(createAdminDto);
    this.logger.log(`Администратор создан: ${admin.login} (ID: ${admin.id})`);
    return admin;
  }

  /**
   * Удаление администратора по ID
   * DELETE /admin/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление администратора по ID' })
  @ApiResponse({
    status: 204,
    description: 'Администратор успешно удален.',
  })
  async deleteAdmin(@Param('id') id: string): Promise<void> {
    this.logger.log(`Удаление администратора с ID: ${id}`);
    await this.adminService.deleteAdmin(id);
    this.logger.log(`Администратор с ID: ${id} удален`);
  }
}
