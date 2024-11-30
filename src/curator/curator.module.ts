import { Module } from '@nestjs/common';
import { CuratorService } from './curator.service';
import { CuratorController } from './curator.controller';

@Module({
  controllers: [CuratorController],
  providers: [CuratorService],
  exports: [CuratorService],
})
export class CuratorModule {}
