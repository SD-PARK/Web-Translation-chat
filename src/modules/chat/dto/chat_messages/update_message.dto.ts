import { PartialType } from "@nestjs/mapped-types"
import { CreateMessageDto } from "./create_message.dto"

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}