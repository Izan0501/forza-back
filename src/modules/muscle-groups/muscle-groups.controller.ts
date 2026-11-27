import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { MuscleGroupsService } from './muscle-groups.service.js';
import { CreateMuscleGroupDto } from './dto/create-muscle-group.dto.js';
import { UpdateMuscleGroupDto } from './dto/update-muscle-group.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('muscle-groups')
export class MuscleGroupsController {
  constructor(private readonly muscleGroupsService: MuscleGroupsService) {}

  @Post()
  create(@Body() createMuscleGroupDto: CreateMuscleGroupDto) {
    return this.muscleGroupsService.create(createMuscleGroupDto);
  }

  @Get()
  findAll() {
    return this.muscleGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.muscleGroupsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMuscleGroupDto: UpdateMuscleGroupDto,
  ) {
    return this.muscleGroupsService.update(id, updateMuscleGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.muscleGroupsService.remove(id);
  }
}
