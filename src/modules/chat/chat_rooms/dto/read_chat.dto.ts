import { IsDate, IsNumber, IsString, MaxLength } from "class-validator";

export class ReadRoomDto {
    @IsNumber()
    room_id: number;

    @IsString()
    @MaxLength(30)
    room_name: string;

    @IsDate()
    created_at: Date;
}