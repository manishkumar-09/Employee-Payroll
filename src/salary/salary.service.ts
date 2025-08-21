import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaryDto } from './dto/create-salary.dto';
import { Role } from '@prisma/client';
import { getMonthRange } from 'src/common/utils/date.utils';

@Injectable()
export class SalaryService {
  constructor(private readonly prisma: PrismaService) {}
  async calculateSalary(dto: SalaryDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: { attendance: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    //determine month range
    const { start, end } = getMonthRange(dto.month);

    //check salary already exists for this emp and month
    const existingSalary = await this.prisma.salary.findFirst({
      where: {
        employeeId: employee.id,
        month: { gte: start, lt: end },
      },
    });
    if (existingSalary) return existingSalary;
    //gross salary
    const grossSalary =
      employee.basicSalary + employee.hra + employee.allowances;

    //tax slab
    let tax = 0;
    if (grossSalary > 50000)
      tax = grossSalary * 0.2; //20%
    else if (grossSalary > 30000)
      tax = grossSalary * 0.1; //10%
    else tax = grossSalary * 0.05; //5%;

    //PF = 12% of basic salary
    const pf = employee.basicSalary * 0.12;

    const attendance = await this.prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: start, lt: end },
      },
    });

    const workingDays = attendance.length || 30;
    const dailyWage = grossSalary / workingDays;

    //salary calcutaltion
    let totalSalary = 0;
    for (const record of attendance) {
      if (record.hoursWorked >= 8) {
        totalSalary += dailyWage;
      } else {
        totalSalary += dailyWage / 2;
      }
    }

    //net salary
    let netSalary = 0;
    if (totalSalary !== 0) {
      netSalary = totalSalary - tax - pf - employee.deduction;
    }

    //save to salary table
    return await this.prisma.salary.create({
      data: {
        month: start,
        grossSalary,
        tax,
        pf,
        totalSalary,
        netSalary,
        employeeId: employee.id,
        updatedAt: new Date(),
      },
    });
  }

  //get employee salary information
  async getSalaryByEmpMonth(
    employeeId: number,
    month: string,
    user: { userId: number; role: string },
  ) {
    //emp can only view their own salary
    if (user.role === Role.EMPLOYEE) {
      const me = await this.prisma.employee.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });

      if (!me) throw new ForbiddenException('Employee profile not found');
      if (me.id !== employeeId) {
        throw new ForbiddenException('You can only view your own salary info');
      }
    }

    //convert month to start/end dates
    const { start, end } = getMonthRange(month);

    //find the salary record
    const salary = await this.prisma.salary.findFirst({
      where: { employeeId, month: { gte: start, lt: end } },
    });

    if (!salary) {
      throw new NotFoundException('salary not found for the requested month');
    }
    return salary;
  }
}
