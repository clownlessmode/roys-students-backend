// src/admin/admin.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './entity/admin.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles.enum';
import { Logger } from '@nestjs/common';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly entityManager: EntityManager) {}

  /**
   * Создание нового администратора
   * @param createAdminDto Данные для создания администратора
   * @returns Созданный администратор
   */
  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { login, password } = createAdminDto;

    this.logger.log(
      `Проверка существования администратора с логином: ${login}`,
    );
    const existingAdmin = await this.entityManager.findOne(Admin, {
      where: { login },
    });
    if (existingAdmin) {
      this.logger.warn(`Администратор с логином ${login} уже существует`);
      throw new UnauthorizedException('Admin с таким логином уже существует');
    }

    const admin = this.entityManager.create(Admin, {
      login,
      password: password,
      role: Role.ADMIN, // Жёстко задаём роль как 'admin'
    });

    this.logger.log(`Сохранение нового администратора: ${login}`);
    const savedAdmin = await this.entityManager.save(Admin, admin);

    // Возвращаем админа без пароля
    const { password: _, ...result } = savedAdmin;
    return result as Admin;
  }

  /**
   * Удаление администратора по ID
   * @param id ID администратора
   */
  async deleteAdmin(id: string): Promise<void> {
    this.logger.log(`Поиск администратора с ID: ${id}`);
    const admin = await this.entityManager.findOne(Admin, { where: { id } });
    if (!admin) {
      this.logger.warn(`Администратор с ID: ${id} не найден`);
      throw new NotFoundException('Admin не найден');
    }

    this.logger.log(`Удаление администратора с ID: ${id}`);
    await this.entityManager.remove(Admin, admin);
    this.logger.log(`Администратор с ID: ${id} удален`);
  }
}
