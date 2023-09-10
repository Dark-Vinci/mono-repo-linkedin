import cluster from 'cluster';
import { cpus } from 'os';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

import { ShutdownService, AppModule } from '@startup';

class App {
  private readonly numCPUs =
    process.env.NODE_ENV === 'development' ? 1 : cpus().length;

  private primaryWorker(): void {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < this.numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log({ code, signal });
      // fork a new cluster
      cluster.fork();
      console.log(`worker ${worker.process.pid} died`);
    });
  }

  private async childWorker(): Promise<void> {
    try {
      // set time zone
      process.env.TZ = 'Africa/Lagos';

      const app = await NestFactory.create(AppModule);
      const shutdownService = app.get(ShutdownService);

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

      const grpcClientOptions: MicroserviceOptions = {
        transport: Transport.GRPC,
        options: {
          package: 'AUTH',
          gracefulShutdown: true,
          protoPath: '../../SDK/grpc/auth/auth.proto',
        },
      };

      app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

      await app.startAllMicroservices();
      await app.listen(3000);
      const url = await app.getUrl();

      console.log(`Worker ${process.pid} started on URL| ${url}`);
    } catch (error) {
      console.log({ error });
    }
  }

  public async start(): Promise<void> {
    if (cluster.isPrimary) {
      this.primaryWorker();
    } else {
      await this.childWorker();
    }
  }
}

new App().start();
