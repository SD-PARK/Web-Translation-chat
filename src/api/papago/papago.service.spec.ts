import { Test, TestingModule } from '@nestjs/testing';
import { PapagoService } from './papago.service';
import { AxiosModule } from 'src/config/axios/axios.module';
import { ConfigModule } from '@nestjs/config';

describe('PapagoService', () => {
  let service: PapagoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AxiosModule,
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
        })],
      providers: [PapagoService],
    }).compile();

    service = module.get<PapagoService>(PapagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('translate', () => {
    it('source 속성 유효성 검사', () => {
      expect(() => service.validate('kr', 'en', '이것은 영어다'))
      .toThrow('source 속성의 언어 코드가 유효하지 않습니다.');
    });
    it('target 속성 유효성 검사', () => {
      expect(() => service.validate('ko', 'eng', '이것은 영어다.'))
      .toThrow('target 속성의 언어 코드가 유효하지 않습니다.');
    });
    it('text 속성 유효성 검사', () => {
      expect(() => service.validate('ko', 'en', '  '))
      .toThrow('text 속성에 유효한 문자열이 입력되어야 합니다.');
    });
    it('번역 기능 테스트', async () => {
      const translatedText = await service.translate('ko', 'en', '이것은 영어다.');
      expect(typeof translatedText).toEqual('string');
    })
    
  });
});
