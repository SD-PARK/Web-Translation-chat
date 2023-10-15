import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ChatRoom } from '../../modules/chat/entities/chat_rooms.entity';
import { ChatMessage } from '../../modules/chat/entities/chat_messages.entity';

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useFactory: async (configService: ConfigService) => ({
      type: 'mysql',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      entities: [ChatRoom, ChatMessage],
      timezone: '+00:00',
      synchronize: false,
    }),
    inject: [ConfigService],
  })],
})
export class DBModule {}
