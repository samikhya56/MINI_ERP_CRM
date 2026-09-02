import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Mini ERP/CRM Backend running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  console.log(`📍 API Base URL: http://localhost:${env.PORT}/api/v1`);
  console.log(`🏥 Health Check: http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful Shutdown Logic
const shutdown = async (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🛑 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🔌 Prisma DB connection closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
