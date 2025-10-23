import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { FilesModule } from './features/common/file-management/files.module';
import { MembersModule } from './features/members/members.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService,
  ],
})
export class AppModule {}
