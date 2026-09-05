import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminService } from './super-admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminGuard, SuperAdminService],
})
export class SuperAdminModule {}
