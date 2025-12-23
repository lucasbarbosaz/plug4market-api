import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaClient as MasterClient } from '@prisma/client-master'; // Import do seu Master
import { RegisterAdminDto } from '../auth/dto/register-admin.dto';
import { HashingServiceProtocol } from '../auth/hash/hashing.service';
import { AuthService } from '../auth/auth.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class MasterUserService {
  private masterClient: MasterClient;
  constructor(
    private readonly hashingService: HashingServiceProtocol,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {
    this.masterClient = new MasterClient();
  }

  async createUser(registerAdminDto: RegisterAdminDto) {

    const passwordHash = await this.hashingService.hash(registerAdminDto.password!);

    const user = await this.masterClient.superUser.create({
      data: {
        email: registerAdminDto.email!,
        password: passwordHash,
        role: registerAdminDto.role
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    return user;

  }

  async findUserByEmail(email: string) {
    const emailUser = await this.masterClient.superUser.findUnique({
      where: {
        email,
      },
    });

    if (!emailUser) {
      throw new HttpException('Email do usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return emailUser;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    return this.masterClient.superUser.update({
      where: {
        id,
      },
      data: {
        refreshToken,
      },
    });
  }
}
