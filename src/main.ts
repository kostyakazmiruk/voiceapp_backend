import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  });
  let port: number = parseInt(process.env.SERVICE_PORT ?? '8000', 10);
  await app.listen(port);
  console.log(`Listening ${port}`);
}
bootstrap();
