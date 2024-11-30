import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegramModule } from '../../common/providers/telegram.module';
import { StudentService } from 'src/student/student.service';
import { StudentModule } from 'src/student/student.module';
@Module({
  imports: [TelegramModule, StudentModule],
  controllers: [],
  providers: [BotService],
})
export class BotModule {}
