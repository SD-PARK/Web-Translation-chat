import { IsDate, IsNumber, Min } from "class-validator";

export class FindMessageDto {
    @IsNumber()
    @Min(0)
    room_id: number;

    @IsDate()
    send_at: Date;

    @IsNumber()
    @Min(0)
    take: number;
}