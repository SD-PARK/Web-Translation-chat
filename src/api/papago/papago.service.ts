import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosService } from 'src/config/axios/axios.service';

@Injectable()
export class PapagoService {
    constructor(
        private readonly axiosService: AxiosService,
        private readonly configService: ConfigService,
    ) {}

    async translate(source: string, target: string, text: string): Promise<string> {
        this.validate(source, target, text);

        const url = 'https://openapi.naver.com/v1/papago/n2mt';
        const result = await this.axiosService.post(url, {
            source: source,
            target: target,
            text: text,
        },
        { headers:
            {
                'X-Naver-Client-Id': this.configService.get<string>('NAVER_CLIENT_ID'),
                'X-Naver-Client-Secret': this.configService.get<string>('NAVER_CLIENT_SECRET'),
            }
        });
        return result.data.message.result.translatedText;
    }

    validate(source: string, target: string, text: string) {
        const languageCode = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW'];
        if (!languageCode.includes(source))
            throw 'source 속성의 언어 코드가 유효하지 않습니다.';
        if(!languageCode.includes(target))
            throw 'target 속성의 언어 코드가 유효하지 않습니다.';
        if(text.trim() === "")
            throw 'text 속성에 유효한 문자열이 입력되어야 합니다.';
    }
}