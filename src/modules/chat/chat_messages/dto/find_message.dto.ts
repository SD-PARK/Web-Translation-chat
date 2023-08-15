import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional } from "class-validator";
import { toDate, toNumber } from 'src/config/helper/cast.helper'

export class FindMessageDto {
    @Transform(({ value }) => toNumber(value, { min: 0 }))
    @IsNumber()
    room_id: number;

    @Transform(({ value }) => toDate(value))
    @IsOptional()
    @IsDate()
    send_at: Date;

    @Transform(({ value }) => toNumber(value, { default: 20, min: 0}))
    @IsOptional()
    @IsNumber()
    take: number;
}