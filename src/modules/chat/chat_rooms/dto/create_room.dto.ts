import { IsString, Validate } from "class-validator";
import { CustomRoomNameValidator } from "src/config/validator/custom_validator";

export class CreateRoomDto {
    @IsString()
    @Validate(CustomRoomNameValidator)
    room_name: string;
}