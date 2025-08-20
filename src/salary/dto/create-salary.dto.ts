import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class SalaryDto {
  @IsDateString()
  month: string; //yyyy-mm format

  @IsInt() // Integer no decimal
  employeeId: number;

  @IsOptional()
  @IsInt()
  payrollId?: number;

  @IsOptional()
  @IsNumber()
  grossSalary?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsNumber()
  pf?: number;

  @IsOptional()
  @IsNumber()
  totalSalary?: number;

  @IsOptional()
  @IsNumber()
  netSalary?: number;
}
