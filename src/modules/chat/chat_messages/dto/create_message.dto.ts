import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMessageDto {
    @IsNumber()
    @Min(0)
    readonly room_id: number;

    @IsString()
    @MaxLength(45)
    readonly user_name: string;

    @IsString()
    @MaxLength(5)
    @IsIn(['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'th', 'de', 'ru', 'es', 'it', 'fr'])
    readonly language: string;

    @IsString()
    @MaxLength(7)
    readonly ip?: string;

    @IsString()
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