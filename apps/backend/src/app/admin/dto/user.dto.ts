import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
