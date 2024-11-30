import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'adminLogin' })
  login: string;

  @IsString()
  @ApiProperty({ example: 'securePassword123' })
  password: string;
}
