import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Roles } from 'src/auth/roles.decorators';
import { SalaryDto } from './dto/create-salary.dto';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('calculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  salary(@Body() dto: SalaryDto) {
    return this.salaryService.calculateSalary(dto);
  }

  @Get(':employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  getSalary(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('month') month: string,
    @Request() req,
  ) {
    return this.salaryService.getSalaryByEmpMonth(+employeeId, month, req.user);
  }
}
