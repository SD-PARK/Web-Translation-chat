import { IsNumber, IsString, IsDate, MaxLength } from 'class-validator';

export class ReadMessageDto {
    @IsNumber()
    readonly message_id: number;

    @IsNumber()
    readonly room_id: number;

    @IsString()
    @MaxLength(45)
    readonly user_name: string;
    
    @IsDate()
    readonly send_at: Date;

    @IsString()
    @MaxLength(5)
    readonly language: string;

    @IsString()
    readonly message_text: string;
}