import { IsIn, IsNumber, IsString, Min } from "class-validator";
import appConfig from "src/config/appConfig";

export class SwitchLanguageDto {
    @IsNumber()
    @Min(0)
    room_id: number;

    @IsString()
    @IsIn(appConfig.supportedLanguage)
    language: string;
}