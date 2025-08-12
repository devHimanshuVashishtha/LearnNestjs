import { IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    age: number;

    @IsOptional()
    @IsString()
    country?: string;

}
