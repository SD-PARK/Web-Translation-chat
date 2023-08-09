import { IsDate, IsNumber, IsString, MaxLength, Min } from "class-validator";

export class ReadRoomDto {
    @IsNumber()
    @Min(0)
    room_id: number;

    @IsString()
    @MaxLength(30)
    room_name: string;

    @IsDate()
    created_at: Date;
}