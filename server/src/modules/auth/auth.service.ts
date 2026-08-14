import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(
      dto.name,
      dto.email,
      dto.password,
    );
    const accessToken = this.signToken(user.id, user.email, user.role);
    return { accessToken, user: this.usersService.toResponse(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    let user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user = await this.usersService.syncRoleFromConfig(user);
    const accessToken = this.signToken(user.id, user.email, user.role);
    return { accessToken, user: this.usersService.toResponse(user) };
  }

  private signToken(userId: string, email: string, role: UserRole): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
