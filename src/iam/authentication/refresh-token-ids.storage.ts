import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(private readonly configService: ConfigService) {}

  private redisClient: Redis;
  async onApplicationBootstrap() {
    // TODO: Move to RedisModule, use envs
    this.redisClient = await new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: +this.configService.get('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async onApplicationShutdown() {
    return await this.redisClient.quit();
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(userId));

    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }

    return storedId === tokenId;
  }

  async invalidate(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }
}
