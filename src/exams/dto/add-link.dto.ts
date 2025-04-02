// src/exams/dto/add-link.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLinkDto {
  @ApiProperty({ example: 'https://example.com/bilety.pdf' })
  @IsString()
  link: string;
}
