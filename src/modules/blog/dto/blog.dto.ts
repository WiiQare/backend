import {
  IsArray,
  IsNotEmpty,
  IsString
} from 'class-validator';

export class CreateBlogDto {

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  cover: string;

  @IsString()
  quote?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
