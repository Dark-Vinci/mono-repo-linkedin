import cluster from 'cluster';
import { cpus } from 'os';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ShutdownService, AppModule } from '@startup';

// set cors and compression, validations;
// set logging

async function bootstrap() {
  try {
    let numCPUs = cpus().length;

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
        const apps = await NestFactory.create(AppModule);
        // apps.connectMicroservice<MicroserviceOptions>(grpcClientOptions);

        await apps.startAllMicroservices();

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
        maxSendMessageLength?: number;
        maxReceiveMessageLength?: number;
        maxMetadataSize?: number;
        keepalive?: {
            keepaliveTimeMs?: number;
            keepaliveTimeoutMs?: number;
            keepalivePermitWithoutCalls?: number;
            http2MaxPingsWithoutData?: number;
            http2MinTimeBetweenPingsMs?: number;
            http2MinPingIntervalWithoutDataMs?: number;
            http2MaxPingStrikes?: number;
        };
        channelOptions?: ChannelOptions;
        credentials?: any;
        protoPath: string | string[];
        package: string | string[];
        protoLoader?: string;
        packageDefinition?: any;
        gracefulShutdown?: boolean;
        loader?: {
            keepCase?: boolean;
            alternateCommentMode?: boolean;
            longs?: Function;
            enums?: Function;
            bytes?: Function;
            defaults?: boolean;
            arrays?: boolean;
            objects?: boolean;
            oneofs?: boolean;
            json?: boolean;
            includeDirs?: string[];
        }; */

        const grpcClientOptions: MicroserviceOptions = {
          transport: Transport.GRPC,
          options: {
            package: 'AUTH',
            gracefulShutdown: true,
            protoPath: '../../SDK/grpc/auth/auth.proto',
          },
        };

        apps.connectMicroservice<MicroserviceOptions>(grpcClientOptions);

        await apps.startAllMicroservices();
        await app.listen(3000);
        const url = await app.getUrl();

        console.log(`Worker ${process.pid} started on URL| ${url}`);
      }
    }
  } catch (error) {
    console.log({ error });
  }
}
bootstrap();
