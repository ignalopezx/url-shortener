import ShortenForm from '../components/ShortenForm/ShortenForm';

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Acortador de URLs</h1>
      <ShortenForm />
      <p className="text-sm text-gray-500">
        Consejo: usá el <strong>Dashboard</strong> para ver tus URLs, estadísticas y eliminar entradas.
      </p>
    </div>
  );
}
