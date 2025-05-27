import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class FilterPatientDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Filter by patient full name (case-insensitive partial match)',
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient email (case-insensitive exact match)',
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization ID',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  readonly organizationId?: string;
}
