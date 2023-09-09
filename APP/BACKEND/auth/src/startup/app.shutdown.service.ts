import { Injectable } from '@nestjs/common';

@Injectable()
export class ShutdownService {
  async shutdown(): Promise<void> {
    // Perform cleanup tasks here
    // For example, close database connections, stop background jobs, etc.
  }
}
