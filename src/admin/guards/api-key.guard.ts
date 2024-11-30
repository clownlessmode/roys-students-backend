import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    // Get the expected token from environment variables or configuration
    const validApiKey = this.configService.get<string>('ADMIN_API_KEY');

    if (apiKeyHeader && apiKeyHeader === validApiKey) {
      return true;
    }
    throw new UnauthorizedException('Invalid API key');
  }
}
