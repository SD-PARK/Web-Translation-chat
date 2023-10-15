import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import appConfig from 'src/config/appConfig';

export class CreateMessageDto {
    @IsNumber()
    @Min(0)
    readonly room_id: number;

    @IsString()
    @MaxLength(45)
    readonly user_name: string;

    @IsString()
    @IsIn(appConfig.supportedLanguage)
    readonly language: string;

    @IsString()
    @IsOptional()
    @MaxLength(7)
    readonly ip?: string;

    @IsString()
    @MaxLength(1000)
    readonly message_text: string;

    @IsString()
    @IsOptional()
    readonly ko_text?: string;

    @IsString()
    @IsOptional()
    readonly en_text?: string;

    @IsString()
    @IsOptional()
    readonly ja_text?: string;
}