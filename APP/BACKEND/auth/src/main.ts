import cluster from 'cluster';
import { availableParallelism } from 'os';

import { NestFactory } from '@nestjs/core';

import { ShutdownService, AppModule } from '@startup';

// set cors and compression, validations;
// set logging

async function bootstrap() {
  try {
    let numCPUs = availableParallelism();

    if (process.env.NODE_ENV === 'development') {
      numCPUs = 1;
    }

    switch (true) {
      case cluster.isPrimary: {
        console.log(`Primary ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
          console.log({ code, signal });
          // fork a new cluster
          cluster.fork();
          console.log(`worker ${worker.process.pid} died`);
        });
        break;
      }
      default: {
        // Workers can share any TCP connection
        // In this case it is an HTTP server

        // set time zone
        process.env.TZ = 'Africa/Lagos';

        const app = await NestFactory.create(AppModule);
        const shutdownService = app.get(ShutdownService);
        // await app.listen(3000);

        // listen to termination signals
        process.on('SIGINT', async () => {
          await shutdownService.shutdown();
          process.exit(0);
        });

        process.on('SIGTERM', async () => {
          await shutdownService.shutdown();
          process.exit(0);
        });

        process.on('SIGHUP', async () => {
          await shutdownService.shutdown();
          process.exit(0);
        });

        await app.listen(3000);

        console.log(`Worker ${process.pid} started`);
      }
    }
  } catch (error) {
    console.log({ error });
  }
}
bootstrap();
