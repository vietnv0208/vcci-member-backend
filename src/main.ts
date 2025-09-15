import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Set global prefix for API routes (except root)
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const port = process.env.PORT || 3000;

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Check-in System API')
    .setDescription('API documentation for the Check-in System')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Development Server')
    // .addServer('https://check-in-detech.twendeesoft.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login and user authentication')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Only write swagger spec file in development mode (Vercel has read-only filesystem)
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Tạo thư mục docs nếu chưa có
      mkdirSync('./docs', { recursive: true });
      writeFileSync(
        join('./docs', 'swagger-spec.json'),
        JSON.stringify(document, null, 2),
      );
      console.log('📄 Swagger spec written to swagger-spec.json');
    } catch (error) {
      console.warn('⚠️ Could not write swagger spec file:', error.message);
    }
  }

  await app.listen(port);

  console.log(
    `🚀 Checkin system API is running on: http://localhost:${port}/api`,
  );
  console.log(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
