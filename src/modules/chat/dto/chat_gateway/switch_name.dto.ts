import { IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class SwitchNameDto {
    @IsNumber()
    @Min(0)
    room_id: number;

    @IsString()
    @MinLength(1)
    @MaxLength(45)
    name: string;
}