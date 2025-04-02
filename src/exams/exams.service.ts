import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from './entities/exam.entity';
import { GroupService } from 'src/group/group.service';
import { CuratorService } from 'src/curator/curator.service';
import { EntityManager } from 'typeorm';
import { ExamEnum } from './enums/exam.enum';
import escapeMarkdownV2 from 'common/func/escaping';
import { Student } from 'src/student/entity/student.entity';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Cron, CronExpression } from '@nestjs/schedule'; // <-- импортируем Cron

@Injectable()
export class ExamsService {
  constructor(
    private manager: EntityManager,
    private groupService: GroupService,
    private curatorService: CuratorService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  logger = new Logger();
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
    const studentsWithTelegram = exam.group.students.filter(
      (student) => !!student.telegram,
    );

    for (const student of studentsWithTelegram) {
      const res = await this.notifyStudentAboutExam(student, exam);

      this.logger.log('Отправил');
    }
    return await this.manager.save(Exam, exam);
  }

  async findAll(type: ExamEnum): Promise<Exam[]> {
    const exams = await this.manager.find(Exam, {
      where: { type },
      relations: {
        group: {
          students: {
            telegram: true,
          },
        },
        curator: true,
      },
    });

    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    const now = new Date();

    for (const exam of exams) {
      const examDate = new Date(exam.holding_date); // Предполагаем, что у экзамена есть поле `date`
      console.log(examDate, now.getTime());
      // Пропускаем экзамены, если они раньше чем через 3 дня
      if (examDate.getTime() - now.getTime() < THREE_DAYS_IN_MS) {
        continue;
      }

      // Фильтруем студентов с telegram
      const studentsWithTelegram = exam.group.students.filter(
        (student) => !!student.telegram,
      );

      for (const student of studentsWithTelegram) {
        const res = await this.notifyStudentAboutExam(student, exam);
        this.logger.log(`Отправил уведомление студенту ${student.first_name}`);
      }
    }

    return exams;
  }

  async findOne(id: string): Promise<Exam> {
    return await this.manager.findOneOrFail(Exam, {
      where: { id },
      relations: {
        group: {
          students: {
            telegram: true,
          },
        },
        curator: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleExamNotificationsThreeDaysBefore() {
    this.logger.log('🕒 [START] Запуск уведомления за 3 дня до экзамена');

    const exams = await this.manager.find(Exam, {
      relations: {
        group: {
          students: {
            telegram: true,
          },
        },
        curator: true,
      },
    });

    this.logger.log(`📄 Найдено экзаменов: ${exams.length}`);

    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    const now = new Date();
    this.logger.log(`📅 Текущая дата: ${now.toISOString()}`);
    this.logger.log(`⌛ Интервал для сравнения: ${THREE_DAYS_IN_MS} мс`);

    for (const exam of exams) {
      const examDate = new Date(exam.holding_date);
      const diff = examDate.getTime() - now.getTime();

      this.logger.log(
        `\n🧪 Проверка экзамена: ${exam.discipline}\n📅 Дата экзамена: ${examDate.toISOString()}\n⏱ Разница во времени: ${diff} мс`,
      );

      // Допустим ±12 часов от 3 дней
      const margin = 12 * 60 * 60 * 1000;

      if (
        diff < THREE_DAYS_IN_MS - margin ||
        diff > THREE_DAYS_IN_MS + margin
      ) {
        this.logger.log(
          '⏭ Экзамен не попадает в диапазон ±12ч от 3 дней. Пропускаем.',
        );
        continue;
      }

      const studentsWithTelegram = exam.group.students.filter(
        (student) => !!student.telegram,
      );

      this.logger.log(
        `👨‍🎓 Студентов с Telegram: ${studentsWithTelegram.length}`,
      );

      for (const student of studentsWithTelegram) {
        this.logger.log(
          `📨 Отправка уведомления студенту: ${student.last_name} ${student.first_name} (${student.telegram.telegram_id})`,
        );

        try {
          await this.notifyStudentAboutExamThree(student, exam);
          this.logger.log('✅ Уведомление успешно отправлено');
        } catch (err) {
          this.logger.error(
            `❌ Ошибка при отправке студенту ${student.last_name} ${student.first_name}: ${err.message}`,
          );
        }
      }
    }

    this.logger.log('✅ [END] Уведомление за 3 дня завершено');
  }

  async notifyStudentAboutExam(student: Student, exam: Exam) {
    // Проверка, есть ли Telegram ID
    if (!student.telegram?.telegram_id) {
      console.warn(
        `У студента ${student.last_name} ${student.first_name} нет Telegram ID`,
      );
      return;
    }

    const examDate = exam.holding_date;
    const formattedDate = examDate.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const message = `
📢 Уведомление о экзамене

👤 ${student.last_name} ${student.first_name} ${student.patronymic}
📚 Дисциплина: ${exam.discipline}
📅 Дата проведения: ${formattedDate}

${exam.link ? '🔗 Ссылка на билеты' + exam.link : ''}

Удачи на экзамене
    `;

    try {
      await this.bot.telegram.sendMessage(
        student.telegram.telegram_id,
        escapeMarkdownV2(message),
        {
          parse_mode: 'MarkdownV2',
        },
      );
      console.log(`✅ Уведомление отправлено студенту ${student.last_name}`);
    } catch (error) {
      console.error(
        `❌ Ошибка при отправке сообщения студенту ${student.last_name}: ${error.message}`,
      );
    }
  }
  async notifyStudentAboutExamThree(student: Student, exam: Exam) {
    // Проверка, есть ли Telegram ID
    if (!student.telegram?.telegram_id) {
      console.warn(
        `У студента ${student.last_name} ${student.first_name} нет Telegram ID`,
      );
      return;
    }

    const examDate = exam.holding_date;
    const formattedDate = examDate.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const message = `
📢📢📢 Экзамен через 3 дня 📢📢📢

👤 ${student.last_name} ${student.first_name} ${student.patronymic}
📚 Дисциплина: ${exam.discipline}
📅 Дата проведения: ${formattedDate}

${exam.link ? '🔗 Ссылка на билеты' + exam.link : ''}

Удачи на экзамене
    `;

    try {
      await this.bot.telegram.sendMessage(
        student.telegram.telegram_id,
        escapeMarkdownV2(message),
        {
          parse_mode: 'MarkdownV2',
        },
      );
      console.log(`✅ Уведомление отправлено студенту ${student.last_name}`);
    } catch (error) {
      console.error(
        `❌ Ошибка при отправке сообщения студенту ${student.last_name}: ${error.message}`,
      );
    }
  }
  async addLink(id: string, link: string): Promise<void> {
    const exam = await this.manager.findOne(Exam, {
      where: { id },
      relations: {
        group: {
          students: {
            telegram: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Экзамен с ID ${id} не найден`);
    }

    exam.link = link;

    const studentsWithTelegram = exam.group.students.filter(
      (student) => !!student.telegram,
    );

    for (const student of studentsWithTelegram) {
      const res = await this.notifyStudentAboutExam(student, exam);

      this.logger.log('Отправил');
    }
    await this.manager.save(Exam, exam);
  }

  async remove(id: string): Promise<void> {
    const exam = await this.findOne(id);
    await this.manager.remove(Exam, exam);
  }
}
