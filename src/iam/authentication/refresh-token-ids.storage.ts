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

  onApplicationBootstrap() {
    // TODO: Move to RedisModule, use envs
    try {
      this.redisClient = new Redis({
        name: 'redis-sinuous-67774',
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        maxRetriesPerRequest: 50,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },

        // url: this.configService.get('REDIS_URL'),
      });
    } catch (error) {
      // Handle Redis connection error, e.g., log, retry, throw
      console.error('Error connecting to Redis:', error);
      throw error;
    }
  }
  onApplicationShutdown() {
    return this.redisClient.quit();
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
