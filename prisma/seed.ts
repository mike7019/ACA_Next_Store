import 'dotenv/config';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function placeholderImage(nombre: string): string {
  return `https://placehold.co/600x600/171717/f97316?text=${encodeURIComponent(nombre)}`;
}

const CATEGORIAS = [
  { nombre: 'Proteinas', descripcion: 'Whey, isolate, caseina y proteina vegana.' },
  { nombre: 'Creatina', descripcion: 'Monohidratada, HCL y formulas de fuerza.' },
  { nombre: 'Pre-entrenos', descripcion: 'Energia y enfoque para tus sesiones de entrenamiento.' },
  { nombre: 'Aminoacidos', descripcion: 'BCAA, EAA y glutamina para recuperacion muscular.' },
  { nombre: 'Vitaminas y Salud', descripcion: 'Multivitaminicos, omega 3 y soporte para el descanso.' },
  { nombre: 'Accesorios', descripcion: 'Shakers, cinturones y accesorios de entrenamiento.' },
];

const PRODUCTOS: Array<{
  categoria: string;
  nombre: string;
  descripcion: string;
  marca: string;
  sabor?: string;
  presentacion: string;
  precio: number;
  stock: number;
  destacado?: boolean;
}> = [
  { categoria: 'Proteinas', nombre: 'Whey Protein Concentrado', descripcion: 'Proteina de suero concentrada, 24g de proteina por porcion.', marca: 'MaxProtein', sabor: 'Chocolate', presentacion: '2 kg', precio: 189900, stock: 25, destacado: true },
  { categoria: 'Proteinas', nombre: 'Whey Protein Isolate', descripcion: 'Aislado de proteina de rapida absorcion, bajo en grasas y carbohidratos.', marca: 'PureForce', sabor: 'Vainilla', presentacion: '1 kg', precio: 159900, stock: 18 },
  { categoria: 'Proteinas', nombre: 'Proteina Vegana de Arveja', descripcion: 'Proteina 100% vegetal a base de arveja, ideal para dietas plant-based.', marca: 'VitaCore', sabor: 'Chocolate', presentacion: '900 g', precio: 129900, stock: 12 },
  { categoria: 'Proteinas', nombre: 'Caseina Nocturna', descripcion: 'Proteina de absorcion lenta, ideal antes de dormir.', marca: 'MaxProtein', sabor: 'Cookies & Cream', presentacion: '1 kg', precio: 169900, stock: 10 },

  { categoria: 'Creatina', nombre: 'Creatina Monohidratada', descripcion: 'Aumenta fuerza y volumen muscular, 5g por porcion.', marca: 'PowerLab', sabor: 'Neutro', presentacion: '300 g', precio: 69900, stock: 40, destacado: true },
  { categoria: 'Creatina', nombre: 'Creatina HCL', descripcion: 'Mayor solubilidad y absorcion, sin retencion de liquidos.', marca: 'NitroMax', sabor: 'Neutro', presentacion: '250 g', precio: 89900, stock: 20 },

  { categoria: 'Pre-entrenos', nombre: 'Pre-Entreno Explosivo', descripcion: 'Energia, enfoque y bombeo muscular para entrenamientos intensos.', marca: 'NitroMax', sabor: 'Sandia', presentacion: '300 g', precio: 99900, stock: 22, destacado: true },
  { categoria: 'Pre-entrenos', nombre: 'Pre-Entreno Sin Estimulantes', descripcion: 'Formula libre de cafeina para entrenar a cualquier hora.', marca: 'PeakFuel', sabor: 'Frutos Rojos', presentacion: '250 g', precio: 94900, stock: 15 },

  { categoria: 'Aminoacidos', nombre: 'BCAA 2:1:1', descripcion: 'Aminoacidos ramificados para reducir el catabolismo muscular.', marca: 'PureForce', sabor: 'Mora Azul', presentacion: '400 g', precio: 79900, stock: 30 },
  { categoria: 'Aminoacidos', nombre: 'EAA Recuperacion Total', descripcion: 'Los 9 aminoacidos esenciales para maxima recuperacion.', marca: 'VitaCore', sabor: 'Limonada', presentacion: '350 g', precio: 84900, stock: 16 },
  { categoria: 'Aminoacidos', nombre: 'Glutamina', descripcion: 'Apoya la recuperacion muscular y el sistema inmune.', marca: 'MaxProtein', sabor: 'Neutro', presentacion: '300 g', precio: 59900, stock: 25 },

  { categoria: 'Vitaminas y Salud', nombre: 'Multivitaminico Deportivo', descripcion: 'Formula completa de vitaminas y minerales para deportistas.', marca: 'VitaCore', presentacion: '60 caps', precio: 49900, stock: 35 },
  { categoria: 'Vitaminas y Salud', nombre: 'Omega 3', descripcion: 'Acidos grasos EPA y DHA para salud cardiovascular.', marca: 'VitaCore', presentacion: '90 caps', precio: 54900, stock: 28 },
  { categoria: 'Vitaminas y Salud', nombre: 'ZMA Recuperacion Nocturna', descripcion: 'Zinc, magnesio y vitamina B6 para mejorar el descanso.', marca: 'PowerLab', presentacion: '90 caps', precio: 64900, stock: 20 },

  { categoria: 'Accesorios', nombre: 'Shaker IronFuel', descripcion: 'Vaso mezclador con malla anti-grumos de 600ml.', marca: 'IronFuel', presentacion: '600 ml', precio: 24900, stock: 50, destacado: true },
  { categoria: 'Accesorios', nombre: 'Cinturon de Levantamiento', descripcion: 'Cinturon de cuero para levantamiento de pesas, talla ajustable.', marca: 'PowerLab', presentacion: 'Talla unica ajustable', precio: 89900, stock: 12 },
  { categoria: 'Accesorios', nombre: 'Guantes de Entrenamiento', descripcion: 'Guantes acolchados para proteger tus manos durante el entrenamiento.', marca: 'PowerLab', presentacion: 'S / M / L', precio: 39900, stock: 20 },
  { categoria: 'Accesorios', nombre: 'Cuerda para Saltar con Rodamientos', descripcion: 'Cuerda de velocidad ajustable con rodamientos de precision.', marca: 'PeakFuel', presentacion: 'Ajustable', precio: 34900, stock: 18 },
];

const METODOS_ENVIO = [
  { nombre: 'Envio Estandar', descripcion: 'Entrega nacional en tiempo regular', costoBase: 12000, diasEstimados: 5 },
  { nombre: 'Envio Express', descripcion: 'Entrega prioritaria en ciudades principales', costoBase: 22000, diasEstimados: 2 },
  { nombre: 'Recogida en Tienda', descripcion: 'Recoge tu pedido directamente en el local', costoBase: 0, diasEstimados: 1 },
];

async function limpiarBaseDeDatos() {
  await prisma.detallePedido.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.direccionEnvio.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.metodoEnvio.deleteMany();
  await prisma.admin.deleteMany();
}

async function main() {
  console.log('Limpiando base de datos...');
  await limpiarBaseDeDatos();

  console.log('Creando cuenta de administrador...');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ironfuel.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  await prisma.admin.create({
    data: {
      nombre: 'Administrador',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  console.log('Creando categorias...');
  const categoriasPorNombre = new Map<string, number>();
  for (const cat of CATEGORIAS) {
    const creada = await prisma.categoria.create({
      data: { nombre: cat.nombre, slug: slugify(cat.nombre), descripcion: cat.descripcion },
    });
    categoriasPorNombre.set(cat.nombre, creada.id);
  }

  console.log('Creando productos...');
  const productosCreados = [];
  for (const p of PRODUCTOS) {
    const categoriaId = categoriasPorNombre.get(p.categoria);
    if (!categoriaId) throw new Error(`Categoria no encontrada: ${p.categoria}`);
    const creado = await prisma.producto.create({
      data: {
        categoriaId,
        nombre: p.nombre,
        slug: slugify(p.nombre),
        descripcion: p.descripcion,
        marca: p.marca,
        sabor: p.sabor ?? null,
        presentacion: p.presentacion,
        precio: new Prisma.Decimal(p.precio),
        stock: p.stock,
        imagenUrl: placeholderImage(p.nombre),
        destacado: p.destacado ?? false,
        activo: true,
      },
    });
    productosCreados.push(creado);
  }

  console.log('Creando metodos de envio...');
  const metodosCreados = [];
  for (const m of METODOS_ENVIO) {
    const creado = await prisma.metodoEnvio.create({
      data: { nombre: m.nombre, descripcion: m.descripcion, costoBase: new Prisma.Decimal(m.costoBase), diasEstimados: m.diasEstimados },
    });
    metodosCreados.push(creado);
  }

  console.log('Creando clientes y pedidos de ejemplo...');
  const laura = await prisma.cliente.create({
    data: { nombre: 'Laura', apellido: 'Martinez', email: 'laura.martinez@example.com', telefono: '3001112233' },
  });
  const direccionLaura = await prisma.direccionEnvio.create({
    data: { clienteId: laura.id, alias: 'Casa', calle: 'Calle 45 #12-30', ciudad: 'Bogota', departamento: 'Cundinamarca', codigoPostal: '110111', esPrincipal: true },
  });

  const whey = productosCreados.find((p) => p.nombre === 'Whey Protein Concentrado')!;
  const creatina = productosCreados.find((p) => p.nombre === 'Creatina Monohidratada')!;
  const shaker = productosCreados.find((p) => p.nombre === 'Shaker IronFuel')!;
  const envioEstandar = metodosCreados.find((m) => m.nombre === 'Envio Estandar')!;

  const subtotalLaura = whey.precio.plus(creatina.precio).plus(shaker.precio);
  const totalLaura = subtotalLaura.plus(envioEstandar.costoBase);

  await prisma.pedido.create({
    data: {
      clienteId: laura.id,
      direccionEnvioId: direccionLaura.id,
      estado: 'confirmado',
      subtotal: subtotalLaura,
      costoEnvio: envioEstandar.costoBase,
      total: totalLaura,
      notas: 'Entregar en horario de la tarde',
      detalles: {
        create: [
          { productoId: whey.id, cantidad: 1, precioUnit: whey.precio, subtotal: whey.precio },
          { productoId: creatina.id, cantidad: 1, precioUnit: creatina.precio, subtotal: creatina.precio },
          { productoId: shaker.id, cantidad: 1, precioUnit: shaker.precio, subtotal: shaker.precio },
        ],
      },
      envio: {
        create: { metodoEnvioId: envioEstandar.id, estado: 'despachado', numeroGuia: 'IF-001' },
      },
      pago: {
        create: { metodo: 'tarjeta_credito', estado: 'aprobado', monto: totalLaura, referenciaExterna: 'PAY-IF-1001', fechaPago: new Date('2026-06-20T09:00:00Z') },
      },
    },
  });

  console.log('Seed completado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
