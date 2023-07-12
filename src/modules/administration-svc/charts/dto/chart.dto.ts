import { IsNumber, IsString } from 'class-validator';

export class ChartDTO {
  @IsNumber()
  registeredCount: number;
  @IsNumber()
  activeCount: number;
  @IsString()
  country: string;
}
