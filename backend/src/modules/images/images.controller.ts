import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { RequestAnalysisDto } from './dto/request-analysis.dto';
import { ImageResponseDto } from './dto/image-response.dto';
import { AnalysisRecordResponseDto } from './dto/analysis-record-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Images & Analyses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Apply to all routes in controller
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('notify-upload')
  @Roles(Role.Clinician) // Only Clinicians can notify about uploads
  @ApiOperation({ summary: 'Notify backend of a new image upload and create its initial record.' })
  @ApiResponse({ status: 201, description: 'Image record successfully created.', type: ImageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  async notifyUpload(
    @Body() createImageDto: CreateImageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImageResponseDto> {
    // clinicianId is user.userId when the user is a Clinician
    if (!user.roles.includes(Role.Clinician)) {
      // This should ideally be caught by RolesGuard, but as a safeguard:
      throw new ForbiddenException('User is not authorized to create image records.');
    }
    const clinicianId = user.userId;
    return this.imagesService.createImageRecord(createImageDto, clinicianId);
  }

  @Post(':imageId/analyses')
  @Roles(Role.Clinician) // Only Clinicians can request new analyses
  @ApiOperation({ summary: 'Request a new analysis for an existing image.' })
  @ApiResponse({ status: 201, description: 'Analysis successfully requested.', type: AnalysisRecordResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Image not found.'})
  async requestAnalysis(
    @Param('imageId') imageId: string,
    @Body() requestAnalysisDto: RequestAnalysisDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnalysisRecordResponseDto> {
    if (!user.roles.includes(Role.Clinician)) {
      // This check might be redundant if RolesGuard is effective, but good for defense in depth.
      throw new ForbiddenException('User is not authorized to request analyses.');
    }
    const clinicianId = user.userId; // The authenticated user is the one initiating.
    return this.imagesService.requestNewAnalysis(imageId, clinicianId, requestAnalysisDto, user);
  }

  @Get(':imageId/analyses')
  @Roles(Role.Clinician, Role.Patient) // Allow Patients to view their own image analyses
  @ApiOperation({ summary: 'Get all analysis records for a specific image.' })
  @ApiResponse({ status: 200, description: 'List of analysis records.', type: [AnalysisRecordResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Image not found.'})
  async getAnalysisHistoryForImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnalysisRecordResponseDto[]> {
    // Authorization logic is now handled in the ImagesService.
    return this.imagesService.getAnalysesForImage(imageId, user);
  }

  @Get('analyses/:analysisId')
  @Roles(Role.Clinician, Role.Patient) // Allow Patients to view their own specific analysis
  @ApiOperation({ summary: 'Get a specific analysis record by its ID.' })
  @ApiResponse({ status: 200, description: 'The analysis record.', type: AnalysisRecordResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Analysis record not found.'})
  async getSpecificAnalysisRecord(
    @Param('analysisId') analysisId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnalysisRecordResponseDto> {
    // Authorization logic is now handled in the ImagesService.
    return this.imagesService.getAnalysisById(analysisId, user);
  }

  @Get(':imageId')
  @Roles(Role.Clinician, Role.Patient) // Allow Patients to view their own image details
  @ApiOperation({ summary: 'Get image details and its full analysis history.' })
  @ApiResponse({ status: 200, description: 'Image details with analysis history.', type: ImageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Image not found.'})
  async getImageDetailsWithHistory(
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImageResponseDto> {
    // Authorization logic is now handled in the ImagesService.
    return this.imagesService.getImageWithHistory(imageId, user);
  }
}