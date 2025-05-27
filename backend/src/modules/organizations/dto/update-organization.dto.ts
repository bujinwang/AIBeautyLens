import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
 
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  // No additional properties needed for now, as all fields in CreateOrganizationDto are included and optionalized by PartialType
} 