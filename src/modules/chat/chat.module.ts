import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmExModule } from 'src/config/typeorm_ex/typeorm_ex.module';
import { ChatMessageRepository } from './repositories/chat_messages.repository';
import { ChatRoomRepository } from './repositories/chat_rooms.repository';
import { ChatGateway } from './chat.gateway';
import { PapagoModule } from 'src/api/papago/papago.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ 
    PapagoModule,
    ScheduleModule.forRoot(),
    TypeOrmExModule.forCustomRepository([ChatMessageRepository, ChatRoomRepository]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
