import { Context as TelegrafContext } from 'telegraf';

interface SessionData {
    messageId?: number;
    chatId?: number; // Добавляем chatId
}

export interface BotContext extends TelegrafContext {
    session: SessionData;
}
