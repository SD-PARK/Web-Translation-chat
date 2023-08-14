import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'customRoomName', async: false })
export class CustomRoomNameValidator implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        // 텍스트에서 공백 제거 및 길이 확인
        // 공백 제외 4글자 이상, 공백 포함 30글자 이내.
        const trimmedText = text.replace(/\s+/g, '');
        return trimmedText.length >= 4 && text.length <= 30;
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return validationArguments.property + ' Properties must be at least 4 characters excluding spaces and not more than 30 characters including spaces.';
    }
}