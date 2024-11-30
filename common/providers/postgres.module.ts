import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entity/admin.entity';
import { Curator } from 'src/curator/entities/curator.entity';
import { Group } from 'src/group/entity/group.entity';
import { Student } from 'src/student/entity/student.entity';
import { Telegram } from 'src/student/entity/telegram.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: configService.getOrThrow<'postgres'>('DATABASE_TYPE'),
          host: configService.getOrThrow<string>('DATABASE_HOST'),
          port: configService.getOrThrow<number>('DATABASE_PORT'),
          username: configService.getOrThrow<string>('DATABASE_USERNAME'),
          password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
          database: configService.getOrThrow<string>('DATABASE_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          useUTC: true,
          poolSize: 20,
          entities: [Student, Curator, Group, Telegram, Admin],
        };
      },
    }),
  ],
})
export class PostgresModule {}
