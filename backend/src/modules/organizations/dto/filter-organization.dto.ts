import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class FilterOrganizationDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Filter by organization name (case-insensitive partial match)',
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization address (case-insensitive partial match)',
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly address?: string;
}
