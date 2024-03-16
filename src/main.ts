import { NestFactory } from '@nestjs/core';
import { AppModule } from './video.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  await app.listen(3000);
}
bootstrap();
