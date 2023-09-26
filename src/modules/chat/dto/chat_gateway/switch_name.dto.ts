import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class SwitchNameDto {
    @IsNumber()
    @Min(0)
    room_id: number;

    @IsString()
    @MinLength(1)
    name: string;
}