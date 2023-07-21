import { Module } from '@nestjs/common';
import { PapagoService } from './papago.service';
import { AxiosModule } from 'src/config/axios/axios.module';

@Module({
  imports: [AxiosModule],
  providers: [PapagoService],
  exports: [PapagoService],
})
export class PapagoModule {}
