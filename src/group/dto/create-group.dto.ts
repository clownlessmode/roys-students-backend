import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'ПМ-21' })
  @IsString({ message: 'Название группы должно быть строкой' })
  @IsNotEmpty({ message: 'Название группы не может быть пустым' })
  name: string;

  @ApiProperty({ example: 'uuid-of-curator' })
  @IsUUID('4', { message: 'curator_id должно быть UUID' })
  @IsNotEmpty({ message: 'Идентификатор преподавателя не может быть пустым' })
  curator_id: string;
}
