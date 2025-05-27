import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Optional: you can pass PrismaClientOptions here, e.g., for logging
      // log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    // PrismaClient's $connect method is called automatically when the first query is run.
    // However, explicitly calling it here can be useful for ensuring the connection
    // is established at startup, or for catching connection errors early.
    // For most use cases, it's optional.
    // await this.$connect();
    // console.log('Prisma Client connected');
  }

  async onModuleDestroy() {
    // Gracefully disconnect when the NestJS application shuts down
    await this.$disconnect();
    // console.log('Prisma Client disconnected');
  }

  // You can add custom methods here if needed, for example, to handle transactions
  // or extend PrismaClient functionality, though often direct use of the inherited
  // PrismaClient methods is sufficient.
}