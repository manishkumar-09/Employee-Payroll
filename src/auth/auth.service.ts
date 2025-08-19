import {
  ConflictException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create_user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from 'src/common/utils/service/password.service';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}
  async userRegistration(dto: CreateUserDto) {
    const { firstname, lastname, email, password } = dto;
    const isUserExist = await this.prisma.user.findFirst({ where: { email } });
    if (isUserExist) {
      throw new ConflictException('User is exists with email');
    }
    const hashedPassword = await this.passwordService.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    return {
      message: 'user registration successfully',
      user: result,
    };
  }

  //login

  async userLogin(dto: LoginDto, res: Response) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid creadentials');
    }

    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid creadentials');
    }

    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    //set HttpOnly cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, //only https
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, //15min expire time of jwt inside it
    });
    return res.json({ message: 'Login successful' });
  }

  //logout
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logged Out' });
  }
}
