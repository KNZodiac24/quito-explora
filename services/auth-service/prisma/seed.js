import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear usuarios de prueba
  const usuarios = [
    {
      nombre: 'Administrador',
      email: 'admin@quitoexplora.com',
      password: hashedPassword,
      telefono: '0991234567',
      direccion: 'Quito, Ecuador',
      rol: 'admin'
    },
    {
      nombre: 'María García',
      email: 'maria@example.com',
      password: hashedPassword,
      telefono: '0987654321',
      direccion: 'Norte de Quito',
      rol: 'usuario'
    },
    {
      nombre: 'Carlos López',
      email: 'carlos@example.com',
      password: hashedPassword,
      telefono: '0976543210',
      direccion: 'Centro Histórico',
      rol: 'usuario'
    },
    {
      nombre: 'Ana Martínez',
      email: 'ana@example.com',
      password: hashedPassword,
      telefono: '0965432109',
      direccion: 'Sur de Quito',
      rol: 'usuario'
    }
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: usuario
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
