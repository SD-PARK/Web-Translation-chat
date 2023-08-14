import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './config/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { PapagoModule } from './api/papago/papago.module';
import { AxiosModule } from './config/axios/axios.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [ DBModule, AxiosModule, PapagoModule, ChatModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    // TypeOrmExModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}