import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImagesService } from './images.service';
// import { CreateImageDto } from './dto/create-image.dto'; // To be created
// import { RequestAnalysisDto } from './dto/request-analysis.dto'; // To be created
// import { ImageResponseDto } from './dto/image-response.dto'; // To be created
// import { AnalysisRecordResponseDto } from './dto/analysis-record-response.dto'; // To be created
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming JWT auth
// import { RolesGuard } from '../auth/guards/roles.guard'; // Assuming Roles guard
// import { Roles } from '../auth/decorators/roles.decorator'; // Assuming Roles decorator
// import { Role } from '../auth/enums/role.enum'; // Assuming Role enum

@ApiTags('Images & Analyses')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard) // Apply to all routes in controller
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // TODO: Endpoint for client to notify backend after GCS upload & create initial Image document
  // POST /images/notify-upload
  // This might take CreateImageDto which includes gcsPath, patientId, initialAnalysisType etc.

  // TODO: Endpoint to request a new/different analysis for an existing image
  // POST /images/:imageId/analyses
  // @Roles(Role.Clinician) // Example role protection
  // @ApiOperation({ summary: 'Request a new analysis for an existing image' })
  // @ApiResponse({ status: 201, description: 'Analysis successfully requested.', type: AnalysisRecordResponseDto })
  // async requestAnalysis(
  //   @Param('imageId') imageId: string,
  //   @Body() requestAnalysisDto: RequestAnalysisDto,
  //   // @CurrentUser() user: any, // If you need the user who initiated
  // ): Promise<AnalysisRecordResponseDto> {
  //   // const initiatedByClinicianId = user.id; // Example
  //   // return this.imagesService.requestNewAnalysis(imageId, initiatedByClinicianId, requestAnalysisDto);
  //   return Promise.resolve(null); // Placeholder
  // }

  // TODO: Endpoint to get analysis history for an image
  // GET /images/:imageId/analyses
  // @Roles(Role.Clinician, Role.Patient) // Example: Both can view if assigned
  // @ApiOperation({ summary: 'Get all analysis records for an image' })
  // @ApiResponse({ status: 200, description: 'List of analysis records.', type: [AnalysisRecordResponseDto] })
  // async getAnalysisHistoryForImage(
  //   @Param('imageId') imageId: string,
  // ): Promise<AnalysisRecordResponseDto[]> {
  //   // return this.imagesService.getAnalysesForImage(imageId);
  //   return Promise.resolve([]); // Placeholder
  // }

  // TODO: Endpoint to get a specific analysis record by its ID
  // GET /analyses/:analysisId  (Note: might be better as /images/analyses/:analysisId for consistency or a separate /analyses controller)
  // @Roles(Role.Clinician, Role.Patient)
  // @ApiOperation({ summary: 'Get a specific analysis record' })
  // @ApiResponse({ status: 200, description: 'The analysis record.', type: AnalysisRecordResponseDto })
  // async getSpecificAnalysisRecord(
  //   @Param('analysisId') analysisId: string,
  // ): Promise<AnalysisRecordResponseDto> {
  //   // return this.imagesService.getAnalysisById(analysisId);
  //   return Promise.resolve(null); // Placeholder
  // }

  // TODO: Consider an endpoint to get an Image document by its ID, potentially including its full analysis history
  // GET /images/:imageId
  // @ApiOperation({ summary: 'Get image details and its full analysis history' })
  // @ApiResponse({ status: 200, description: 'Image details with analysis history.', type: ImageResponseDto })
  // async getImageDetailsWithHistory(
  //   @Param('imageId') imageId: string,
  // ): Promise<ImageResponseDto> {
  //   // return this.imagesService.getImageWithHistory(imageId);
  //   return Promise.resolve(null); // Placeholder
  // }
}