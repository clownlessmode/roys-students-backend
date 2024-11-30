import { Injectable, NotFoundException } from '@nestjs/common';
import escapeMarkdownV2 from 'common/func/escaping';
import { Action, Ctx, Start, Update, On } from 'nestjs-telegraf';
import { StudentService } from 'src/student/student.service';
import { Markup, Context } from 'telegraf';

@Update()
@Injectable()
export class BotService {
  constructor(private studentService: StudentService) {}

  private messageId: number;
  private fio: string;
  private password: string;
  private isAwaitingPassword = false; // Переменная состояния для пароля

  @Start()
  private async startBot(@Ctx() ctx: Context, isEditing: boolean = false) {
    let student;

    try {
      student = await this.studentService.findByTelegram(ctx.from.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Если студент не найден, просто продолжаем с student как undefined
        student = undefined;
      } else {
        // Перебрасываем другие ошибки, если они есть
        throw error;
      }
    }
    const user = ctx.from;
    const baseUrl = 'https://r6nt2plp-3001.asse.devtunnels.ms/login';
    const queryParams = student
      ? `?login=${student.login}&password=${student.password}`
      : '';

    const finalUrl = baseUrl + queryParams;
    const WelcomingMessage = student
      ? `
🌟 *Добро пожаловать обратно\\, ${student.last_name} ${student.first_name} ${student.patronymic}\\!* 🌟

Мы уже зарегистрировали вас в системе\\. Вот ваши данные\\:
  *Логин:* ${escapeMarkdownV2(student.login)}
  *Пароль:* ||${escapeMarkdownV2(student.password)}||

_↓ Нажмите кнопку\\, чтобы перейти на сайт\\ ↓_
    `
      : `
🌟 *Добро пожаловать\\, ${user.first_name ? user.first_name : ''}${user.last_name ? ' ' + user.last_name : ''}\\!* 🌟

📝 *Как начать\\?*
Введите ниже своё ФИО для уточнения информации

_↓ Так же вы можете перейти на сайт\\, по кнопке ↓_
    `;

    const message = await ctx.reply(WelcomingMessage, {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🌐 Перейти на сайт', finalUrl)],
      ]),
    });
    this.messageId = message.message_id;
  }

  @On('text')
  private async handleText(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (this.isAwaitingPassword) {
      // Если ожидаем ввод пароля
      await this.handlePassword(ctx);
      return;
    }

    if (this.isTextMessage(message)) {
      const text = message.text;
      const fioRegex = /^[А-ЯЁа-яё]+\s[А-ЯЁа-яё]+\s[А-ЯЁа-яё]+$/;

      const loadingStates: string[] = [];
      const baseLoadingText = '⏳ ЗАГРУЗКА';
      const totalSteps = 3 * 1;
      const maxDots = 3;

      for (let i = 0; i < totalSteps; i++) {
        const dots = '.'.repeat(i % (maxDots + 1));
        const escapedDots = dots.replace(/\./g, '\\.');
        loadingStates.push(`${baseLoadingText}${escapedDots}`);
      }

      for (const state of loadingStates) {
        await ctx.telegram.editMessageText(
          message.chat.id,
          this.messageId,
          undefined,
          state,
          { parse_mode: 'MarkdownV2' },
        );
        await this.sleep(100);
      }

      if (fioRegex.test(text)) {
        this.fio = text;
        await ctx.telegram.editMessageText(
          message.chat.id,
          this.messageId,
          undefined,
          `
✅ *Спасибо\\, ${text}\\! Ваше ФИО принято\\!*
          
👀 *Убедитесь, что всё верно\\.*
Убедитесь\\, что вы ввели правильно ваше имя\\.
          `,
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback('✅ Всё верно', 'confirm_fio'),
                Markup.button.callback('✏️ Редактировать', 'edit_start'), // Изменено на 'edit_start'
              ],
            ]),
          },
        );
      } else {
        await ctx.telegram.editMessageText(
          message.chat.id,
          this.messageId,
          undefined,
          `
❌ *ФИО набрано неверно\\. Пожалуйста, попробуйте написать снова\\.*

❓ *Что не так\\?*
Убедитесь\\, что вы ввели ваше полное имя в правильном формате\\.

_Например: __Иванов Иван Иванович___
          `,
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔙 Вернуться назад', 'return_to_start')], // Оставлено как есть
            ]),
          },
        );
      }
    } else {
      await ctx.reply(
        '❗ Пожалуйста\\, отправьте текстовое сообщение с вашим ФИО\\.',
      );
    }
  }

  @Action('confirm_fio')
  private async confirmFio(@Ctx() ctx: Context) {
    try {
      const student = await this.studentService.findByNames(this.fio);

      if (student.telegram && student.telegram.telegram_id) {
        await ctx.editMessageText(
          '❗ *Сессия недействительна, попробуйте ввести другое ФИО*',
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔄 Повторить снова', 'return_to_start')],
            ]),
          },
        );
        return;
      }

      await ctx.editMessageText(
        '✅ *Данные подтверждены\\.* Нажмите \\"Создать пароль\\", чтобы продолжить\\.',
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🔑 Создать пароль', 'create_password')],
          ]),
        },
      );
    } catch (error) {
      console.error('Error finding student:', error.message);

      if (error instanceof NotFoundException) {
        // Обработка NotFoundException
        await ctx.editMessageText(
          '❌ Студент не найден\\. Пожалуйста, начните регистрацию заново\\, или обратитесь к преподавателю\\.',
          {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('🔄 Повторить снова', 'return_to_start')],
            ]),
          },
        );
      } else {
        // Обработка других ошибок
        await ctx.reply(
          '❗ Произошла ошибка\\. Попробуйте снова позже или обратитесь к администратору\\.',
          { parse_mode: 'MarkdownV2' },
        );
      }
    }
  }

  @Action('create_password')
  private async createPassword(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    this.isAwaitingPassword = true; // Устанавливаем состояние ожидания пароля
    await ctx.editMessageText('🔐 *Введите пароль ниже*', {
      parse_mode: 'MarkdownV2',
    });
  }

  private async handlePassword(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (this.isTextMessage(message)) {
      const password = message.text;

      // Regex for Latin letters, numbers, and special characters, with length 4-16
      const passwordRegex = /^[\x21-\x7E]{4,16}$/;

      if (!passwordRegex.test(password)) {
        this.isAwaitingPassword = true; // Keep awaiting password input
        const replyMessage = await ctx.reply(
          `❌ Пароль должен содержать только латинские буквы\\, цифры или специальные символы и быть от 4 до 16 символов длиной\\.

Введите пароль заново ↓`,
          { parse_mode: 'MarkdownV2' },
        );
        this.messageId = replyMessage.message_id; // Update messageId
        return;
      }

      // If valid, set the password and proceed
      this.password = password;
      this.isAwaitingPassword = false; // Reset password state

      // Check if this.messageId is defined before using it
      if (!this.messageId) {
        console.error('Error: messageId is undefined.');
        return;
      }

      // Attempt to edit message text for confirmation
      const confirmationMessage = await ctx.telegram.editMessageText(
        message.chat.id,
        this.messageId,
        undefined,
        `
🔑 *Всё верно\\?*
Ваш пароль: ||${escapeMarkdownV2(this.password)}||
            `,
        {
          parse_mode: 'MarkdownV2',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Всё верно', 'confirm_password')],
            [Markup.button.callback('✏️ Редактировать', 'edit_password')],
          ]),
        },
      );

      // Debugging: Log the confirmation message response
      console.log('Confirmation message response:', confirmationMessage);
    }
  }

  @Action('edit_password')
  private async editPassword(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    this.isAwaitingPassword = true; // Снова устанавливаем состояние ожидания пароля
    await ctx.editMessageText(
      '✏️ *Введите пароль ещё раз\\, чтобы изменить его*',
      { parse_mode: 'MarkdownV2' },
    );
  }

  @Action('confirm_password')
  private async confirmPassword(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    // Проверяем, введен ли пароль
    if (!this.password) {
      await ctx.reply(
        '❗ Пароль не был введен. Пожалуйста, начните регистрацию заново.',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }
    let student;
    // Ищем студента по ФИО
    try {
      student = await this.studentService.findByNames(this.fio);
    } catch (error) {
      return await ctx.editMessageText(
        '❌ Студент не найден. Пожалуйста, начните регистрацию заново, или обратитесь к преподавателю.',
        { parse_mode: 'MarkdownV2' },
      );
    }

    // Получаем данные Telegram из контекста
    const telegramData = {
      telegram_id: ctx.from.id,
      username: ctx.from.username || '',
      first_name: ctx.from.first_name || '',
      language_code: ctx.from.language_code || 'en',
      is_bot: ctx.from.is_bot,
    };

    // Обновляем данные студента
    await this.studentService.updateStudentTelegramAndPassword(
      student.id,
      telegramData,
      this.password,
    );

    const escapedLogin = escapeMarkdownV2(student.login);
    const escapedPassword = escapeMarkdownV2(this.password);

    // Выводим сообщение с реальным логином и паролем
    const baseUrl = 'https://r6nt2plp-3001.asse.devtunnels.ms/login';
    const queryParams = student
      ? `?login=${student.login}&password=${student.password}`
      : '';

    const finalUrl = baseUrl + queryParams;
    await ctx.editMessageText(
      // `✅ *Ваш логин: ${escapedLogin}, ваш пароль: ${escapedPassword}*`

      `
🌟 *Регистрация прошла успешно\\!* 🌟

Мы зарегистрировали вас в системе\\. Вот ваши данные\\:
  *Логин:* ${escapedLogin}
  *Пароль:* ||${escapedPassword}||

_↓ Нажмите кнопку\\, чтобы перейти на сайт\\ ↓_
    `,
      {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          [Markup.button.url('🌐 Перейти на сайт', finalUrl)],
        ]),
      },
    );

    // Сбрасываем временные данные
    this.fio = '';
    this.password = '';
  }

  private isTextMessage(message: any): message is { text: string } {
    return typeof message?.text === 'string';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  @Action('return_to_start')
  private async returnToStart(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    // Сбрасываем временные данные
    this.fio = '';
    this.password = '';
    this.isAwaitingPassword = false;

    // Отправляем приветственное сообщение заново
    await this.startBot(ctx);
  }

  @Action('edit_start') // Новый обработчик для редактирования
  private async editStart(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();

    // Сбрасываем только необходимые данные для редактирования
    this.password = '';
    this.isAwaitingPassword = false;

    // Отправляем сообщение для редактирования ФИО
    await ctx.editMessageText('✏️ *Редактируйте ваше ФИО ниже*', {
      parse_mode: 'MarkdownV2',
    });

    // Устанавливаем состояние ожидания ФИО снова
    // Можно также повторно вызвать handleText или аналогичный метод
  }
}
