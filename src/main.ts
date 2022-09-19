import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { fastifyHelmet } from 'fastify-helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaService } from './prisma.service';
import { AppModule } from './app.module';
import fastifyMultipart from 'fastify-multipart';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ignoreTrailingSlash: true,
      // logger: true,
    }),
    { cors: true },
  );

  app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 1024, //Max field name size in bytes
      fieldSize: 128 * 1024 * 1024 * 1024, //Max field value size in bytes
      fields: 10, //Max number of non-file fields
      fileSize: 6291456, //For multipart forms, the max file size
      files: 500, //Max number of file fields
      headerPairs: 2000, //Max number of header key => value pairs
    },
  });
  app.setGlobalPrefix('/api/v1');

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  app.enableShutdownHooks();

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const config = new DocumentBuilder()
    .setTitle('Devari ERP')
    .setDescription('API documentation for ERP system')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT, '0.0.0.0', (err, address) => {
    if (err) {
      console.log(err);
      process.exit(0);
    }
  });
}
bootstrap();
