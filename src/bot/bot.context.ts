import { Context as TelegrafContext } from 'telegraf';

interface SessionData {
  messageId?: number;
  chatId?: string; // Добавляем chatId
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
