import {
    IsArray,
    IsNotEmpty,
    IsString
} from 'class-validator';

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsNotEmpty()
    @IsString()
    blog: string;

}
