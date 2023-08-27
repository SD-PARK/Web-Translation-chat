import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmExModule } from 'src/config/typeorm_ex/typeorm_ex.module';
import { ChatMessageRepository } from './chat_messages/chat_messages.repository';
import { ChatRoomRepository } from './chat_rooms/chat_rooms.repository';
import { ChatGateway } from './chat.gateway';
import { PapagoModule } from 'src/api/papago/papago.module';

@Module({
  imports: [ 
    PapagoModule,
    TypeOrmExModule.forCustomRepository([ChatMessageRepository, ChatRoomRepository]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
