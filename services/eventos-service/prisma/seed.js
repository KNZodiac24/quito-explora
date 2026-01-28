import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding eventos database...');

  const eventos = [
    {
      titulo: 'Concierto de Rock en el Parque',
      descripcion: 'Gran concierto con las mejores bandas de rock nacional e internacional.',
      categoria: 'Concierto',
      fecha_evento: new Date('2024-03-15'),
      hora_inicio: '18:00',
      hora_fin: '23:00',
      lugar: 'Parque La Carolina',
      direccion_lugar: 'Av. Amazonas y Naciones Unidas',
      sector: 'Norte',
      capacidad_max: 5000,
      precio_entrada: 25.00,
      organizador: 'Rock Events Ecuador',
      contacto_organizador: 'info@rockevents.ec',
      es_gratuito: false,
      requiere_reserva: true,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 16,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: true
    },
    {
      titulo: 'Festival Gastronómico del Centro Histórico',
      descripcion: 'Degusta los mejores platos tradicionales de Quito en un solo lugar.',
      categoria: 'Gastronomia',
      fecha_evento: new Date('2024-03-20'),
      hora_inicio: '10:00',
      hora_fin: '20:00',
      lugar: 'Plaza Grande',
      direccion_lugar: 'Centro Histórico de Quito',
      sector: 'Centro',
      capacidad_max: 2000,
      precio_entrada: 0,
      organizador: 'Municipio de Quito',
      contacto_organizador: 'cultura@quito.gob.ec',
      es_gratuito: true,
      requiere_reserva: false,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 0,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: false
    },
    {
      titulo: 'Hackathon Tech Quito 2024',
      descripcion: '48 horas de innovación tecnológica con premios increíbles.',
      categoria: 'Tecnologia',
      fecha_evento: new Date('2024-04-05'),
      hora_inicio: '09:00',
      hora_fin: '18:00',
      lugar: 'Centro de Convenciones Eugenio Espejo',
      direccion_lugar: 'Av. 10 de Agosto y Colón',
      sector: 'Norte',
      capacidad_max: 300,
      precio_entrada: 15.00,
      organizador: 'TechHub Ecuador',
      contacto_organizador: 'hackathon@techhub.ec',
      es_gratuito: false,
      requiere_reserva: true,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 18,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: true
    },
    {
      titulo: 'Obra de Teatro: El Quijote',
      descripcion: 'Adaptación moderna de la obra clásica de Cervantes.',
      categoria: 'Teatro',
      fecha_evento: new Date('2024-03-25'),
      hora_inicio: '19:30',
      hora_fin: '22:00',
      lugar: 'Teatro Nacional Sucre',
      direccion_lugar: 'Plaza del Teatro, Centro Histórico',
      sector: 'Centro',
      capacidad_max: 500,
      precio_entrada: 35.00,
      organizador: 'Compañía Nacional de Teatro',
      contacto_organizador: 'reservas@teatrosucre.com',
      es_gratuito: false,
      requiere_reserva: true,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 12,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: false
    },
    {
      titulo: 'Carrera 10K Quito',
      descripcion: 'Carrera atlética por las calles más emblemáticas de la ciudad.',
      categoria: 'Deportes',
      fecha_evento: new Date('2024-04-10'),
      hora_inicio: '07:00',
      hora_fin: '12:00',
      lugar: 'Parque El Ejido',
      direccion_lugar: 'Av. 6 de Diciembre y Patria',
      sector: 'Centro',
      capacidad_max: 3000,
      precio_entrada: 20.00,
      organizador: 'Federación Deportiva de Pichincha',
      contacto_organizador: 'inscripciones@fdp.ec',
      es_gratuito: false,
      requiere_reserva: true,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 15,
      accesibilidad_discapacidad: false,
      estacionamiento_disponible: true
    },
    {
      titulo: 'Exposición de Arte Contemporáneo',
      descripcion: 'Muestra de artistas ecuatorianos emergentes.',
      categoria: 'Arte',
      fecha_evento: new Date('2024-03-18'),
      hora_inicio: '10:00',
      hora_fin: '18:00',
      lugar: 'Centro de Arte Contemporáneo',
      direccion_lugar: 'Montevideo y Luis Dávila',
      sector: 'Centro',
      capacidad_max: 200,
      precio_entrada: 5.00,
      organizador: 'Fundación Museos de Quito',
      contacto_organizador: 'info@fundacionmuseos.ec',
      es_gratuito: false,
      requiere_reserva: false,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 0,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: false
    },
    {
      titulo: 'Taller de Programación para Niños',
      descripcion: 'Aprende a programar videojuegos de forma divertida.',
      categoria: 'Educacion',
      fecha_evento: new Date('2024-03-30'),
      hora_inicio: '09:00',
      hora_fin: '13:00',
      lugar: 'Biblioteca Municipal',
      direccion_lugar: 'García Moreno y Espejo',
      sector: 'Centro',
      capacidad_max: 30,
      precio_entrada: 0,
      organizador: 'Code Kids Ecuador',
      contacto_organizador: 'talleres@codekids.ec',
      es_gratuito: true,
      requiere_reserva: true,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 8,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: false
    },
    {
      titulo: 'Picnic Familiar en el Parque',
      descripcion: 'Día de actividades recreativas para toda la familia.',
      categoria: 'Familiar',
      fecha_evento: new Date('2024-04-01'),
      hora_inicio: '10:00',
      hora_fin: '16:00',
      lugar: 'Parque Metropolitano',
      direccion_lugar: 'Av. Mariana de Jesús',
      sector: 'Norte',
      capacidad_max: 1000,
      precio_entrada: 0,
      organizador: 'Municipio de Quito',
      contacto_organizador: 'parques@quito.gob.ec',
      es_gratuito: true,
      requiere_reserva: false,
      es_virtual: false,
      estado: 'Programado',
      edad_minima: 0,
      accesibilidad_discapacidad: true,
      estacionamiento_disponible: true
    }
  ];

  for (const evento of eventos) {
    await prisma.evento.create({ data: evento });
  }

  console.log('Seeding eventos completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
