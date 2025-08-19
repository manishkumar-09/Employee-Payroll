import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorators';
import { CreateUserDto } from './dto/create_user.dto';
import { LoginDto } from './dto/user-login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Response } from 'express';
// import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Roles('HR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() data: CreateUserDto) {
    return this.authService.userRegistration(data);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.authService.userLogin(dto, res);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
