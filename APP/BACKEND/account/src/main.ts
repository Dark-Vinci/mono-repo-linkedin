import { NestFactory } from '@nestjs/core';

import { AppModule } from './startup/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  process.env.TZ = 'America/New_York';
  await app.listen(3000);
}

bootstrap();
