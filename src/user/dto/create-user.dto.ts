import { IsEmail, IsString, IsNumber, IsOptional, IsStrongPassword } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    age: number;

    @IsOptional()
    @IsString()
    country?: string;

    profilepic?: string | null;

}
