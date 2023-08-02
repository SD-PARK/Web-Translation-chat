import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
    @IsNumber()
    readonly room_id: number;

    @IsString()
    @MaxLength(45)
    readonly user_name: string;

    @IsString()
    @MaxLength(5)
    readonly language: string;

    @IsString()
    readonly message_text: string;
}