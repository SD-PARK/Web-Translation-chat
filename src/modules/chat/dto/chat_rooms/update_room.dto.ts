import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create_room.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}