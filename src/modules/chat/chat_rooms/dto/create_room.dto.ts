import { IsString, MaxLength } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @MaxLength(30)
    room_name: string;
}