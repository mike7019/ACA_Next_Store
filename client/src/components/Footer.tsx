export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-neutral-200">
            IRON<span className="text-brand-500">FUEL</span> Suplementos
          </p>
          <p>Proteinas, creatina, pre-entrenos y mas para llevar tu entrenamiento al siguiente nivel.</p>
        </div>
        <p className="mt-6 text-xs text-neutral-600">© {new Date().getFullYear()} IronFuel Suplementos. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
