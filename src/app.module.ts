import { Module } from '@nestjs/common';
import { EnvFilePathModule } from '../common/providers/env-file-path.module';
import { PostgresModule } from '../common/providers/postgres.module';
import { BotModule } from './bot/bot.module';
import { AuthModule } from './auth/auth.module';
import { CuratorModule } from './curator/curator.module';
import { StudentModule } from './student/student.module';
import { GroupModule } from './group/group.module';
import { AdminModule } from './admin/admin.module';
import { ExamsModule } from './exams/exams.module';
import { MarkModule } from './mark/mark.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EnvFilePathModule,
    PostgresModule,
    BotModule,
    AuthModule,
    CuratorModule,
    StudentModule,
    GroupModule,
    AdminModule,
    ExamsModule,
    MarkModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
