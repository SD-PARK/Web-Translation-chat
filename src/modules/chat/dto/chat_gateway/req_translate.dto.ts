import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";
import appConfig from "src/config/appConfig";

export class ReqTranslateDto {
    @IsNumber()
    @Min(1)
    message_id: number;

    @IsString()
    @IsIn(appConfig.supportedLanguage)
    language: string;

    @IsNumber()
    @IsOptional()
    retryCount?: number;
}