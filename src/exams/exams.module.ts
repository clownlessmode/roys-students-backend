import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { Group } from '../group/entity/group.entity';
import { Curator } from '../curator/entities/curator.entity';
import { GroupModule } from '../group/group.module';
import { CuratorModule } from '../curator/curator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Group, Curator]),
    GroupModule,
    CuratorModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
