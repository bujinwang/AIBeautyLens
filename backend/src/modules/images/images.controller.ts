import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
// import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Assuming a CurrentUser decorator
// import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface'; // Assuming an interface for the user object

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
    // @CurrentUser() user: AuthenticatedUser, // TODO: Get clinicianId from authenticated user
  ): Promise<ImageResponseDto> {
    const clinicianId = 'mock-clinician-id'; // Placeholder: Replace with actual clinicianId from user
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
    // @CurrentUser() user: AuthenticatedUser, // TODO: Get clinicianId from authenticated user
  ): Promise<AnalysisRecordResponseDto> {
    const clinicianId = 'mock-clinician-id'; // Placeholder: Replace with actual clinicianId from user
    return this.imagesService.requestNewAnalysis(imageId, clinicianId, requestAnalysisDto);
  }

  @Get(':imageId/analyses')
  @Roles(Role.Clinician) // Only Clinicians can access for now
  @ApiOperation({ summary: 'Get all analysis records for a specific image.' })
  @ApiResponse({ status: 200, description: 'List of analysis records.', type: [AnalysisRecordResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Image not found.'})
  async getAnalysisHistoryForImage(
    @Param('imageId') imageId: string,
    // @CurrentUser() user: AuthenticatedUser, // TODO: Add logic to ensure user is authorized for this image
  ): Promise<AnalysisRecordResponseDto[]> {
    // TODO: Add authorization check:
    // - If user is Patient, ensure imageId belongs to them.
    // - If user is Clinician, ensure they are assigned to the patient owning the image.
    return this.imagesService.getAnalysesForImage(imageId);
  }

  @Get('analyses/:analysisId') // Path changed for consistency
  @Roles(Role.Clinician) // Assuming Clinician access for now
  @ApiOperation({ summary: 'Get a specific analysis record by its ID.' })
  @ApiResponse({ status: 200, description: 'The analysis record.', type: AnalysisRecordResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Analysis record not found.'})
  async getSpecificAnalysisRecord(
    @Param('analysisId') analysisId: string,
    // @CurrentUser() user: AuthenticatedUser, // TODO: Add authorization logic
  ): Promise<AnalysisRecordResponseDto> {
    // TODO: Add authorization check:
    // - Ensure the user (Clinician/Patient) is authorized to view this specific analysis.
    //   This might involve checking the associated image and its ownership/assignments.
    return this.imagesService.getAnalysisById(analysisId);
  }

  @Get(':imageId')
  @Roles(Role.Clinician) // Assuming Clinician access for now
  @ApiOperation({ summary: 'Get image details and its full analysis history.' })
  @ApiResponse({ status: 200, description: 'Image details with analysis history.', type: ImageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Image not found.'})
  async getImageDetailsWithHistory(
    @Param('imageId') imageId: string,
    // @CurrentUser() user: AuthenticatedUser, // TODO: Add authorization logic
  ): Promise<ImageResponseDto> {
    // TODO: Add authorization check
    return this.imagesService.getImageWithHistory(imageId);
  }
}