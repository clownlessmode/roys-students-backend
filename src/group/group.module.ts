import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { CuratorModule } from 'src/curator/curator.module';
import { GroupController } from './group.controller';

@Module({
  imports: [CuratorModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
