import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class FilterClinicianDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}