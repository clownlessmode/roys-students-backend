import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Student } from './entity/student.entity';
import { CreateStudentDto } from './dto/createStudent.dto';
import { GroupService } from 'src/group/group.service';
import generateLogin from 'common/func/generateLogin';
import { Telegram } from './entity/telegram.entity';
import { UpdateStudentDto } from './dto/updateStudent.dto';

@Injectable()
export class StudentService {
  constructor(
    private manager: EntityManager,
    private groupService: GroupService,
  ) {}
  async findOne(id: string): Promise<Student> {
    return await this.manager.findOneOrFail(Student, {
      where: { id },
      relations: {
        group: true,
        telegram: true,
      },
    });
  }

  async getMe(studentId: string): Promise<Student> {
    return this.findOne(studentId);
  }

  async getBuCurator(curatorId: string): Promise<Student[]> {
    return this.manager.find(Student, {
      where: {
        group: {
          curator: {
            id: curatorId,
          },
        },
      },
      relations: {
        group: true,
        telegram: true,
      },
    });
  }

  async findByNames(names: string): Promise<Student> {
    const [first_name, last_name, patronymic] = names.split(' ');

    try {
      const student = await this.manager.findOneOrFail(Student, {
        where: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          patronymic: patronymic.trim(),
        },
        relations: {
          telegram: true,
        },
      });
      return student;
    } catch (error) {
      throw new NotFoundException('Студент с таким ФИО не найден');
    }
  }

  async findMany(): Promise<Student[]> {
    return await this.manager.find(Student, {
      relations: {
        group: true,
      },
    });
  }

  async findByFio(fio: string): Promise<Student | undefined> {
    const [lastName, firstName, patronymic] = fio.trim().split(/\s+/);

    if (!lastName || !firstName || !patronymic) {
      return undefined;
    }

    return this.manager.findOne(Student, {
      where: {
        last_name: lastName,
        first_name: firstName,
        patronymic: patronymic,
      },
      relations: { telegram: true },
    });
  }

  async findByTelegram(telegramId: number): Promise<Student> {
    try {
      const student = await this.manager.findOneOrFail(Student, {
        where: {
          telegram: {
            telegram_id: telegramId,
          },
        },
        relations: {
          telegram: true,
        },
      });
      return student;
    } catch (error) {
      throw new NotFoundException('Студент с таким Telegram ID не найден');
    }
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const group = await this.groupService.findOne(dto.group_id);
    const student = await this.manager.create(Student, {
      login: generateLogin(
        dto.first_name,
        dto.last_name,
        dto.patronymic,
        group.name,
      ),
      password: '',
      first_name: dto.first_name,
      group: group,
      last_name: dto.last_name,
      patronymic: dto.patronymic,
    });
    return await this.manager.save(Student, student);
  }

  async updateStudentTelegramAndPassword(
    studentId: string,
    telegramData: {
      telegram_id: number;
      username?: string;
      first_name?: string;
      language_code?: string;
      is_bot: boolean;
    },
    password: string,
  ): Promise<Student> {
    // Находим студента по id
    const student = await this.manager.findOne(Student, {
      where: { id: studentId },
      relations: { telegram: true },
    });

    if (!student) {
      throw new NotFoundException('Студент не найден');
    }

    // Проверяем, существует ли уже запись для Telegram
    let telegram = await this.manager.findOne(Telegram, {
      where: { telegram_id: telegramData.telegram_id },
    });

    if (!telegram) {
      // Если Telegram-записи нет, создаем новую с обязательными полями
      telegram = this.manager.create(Telegram, telegramData);
      telegram = await this.manager.save(Telegram, telegram);
    } else {
      // Обновляем существующую запись Telegram
      telegram.username = telegramData.username;
      telegram.first_name = telegramData.first_name;
      telegram.language_code = telegramData.language_code;
      telegram.is_bot = telegramData.is_bot;
      await this.manager.save(Telegram, telegram);
    }

    // Устанавливаем обновленную запись Telegram в студенте
    student.telegram = telegram;

    // Устанавливаем новое значение для password
    student.password = password;

    // Сохраняем изменения
    return await this.manager.save(Student, student);
  }

  async update(id: string, updateGroupDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    // Обновление полей
    Object.assign(student, updateGroupDto);

    return await this.manager.save(Student, student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.manager.remove(Student, student);
  }
}
