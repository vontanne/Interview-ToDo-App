import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SERVER_CONFIG } from './configs/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('TODO App API')
    .setDescription('API documentation for the TODO application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(SERVER_CONFIG.APP_PORT, () => {
    console.log(`Server is running on port ${SERVER_CONFIG.APP_PORT}`);
  });
}
bootstrap();
