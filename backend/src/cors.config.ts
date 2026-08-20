import type { INestApplication } from '@nestjs/common';

export function configureCors(
  app: Pick<INestApplication, 'enableCors'>,
  frontendUrl: string,
): void {
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
