import React from 'react';
import ShortenForm from '../components/ShortenForm/ShortenForm.tsx';

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Acortá tu URL</h1>
      <ShortenForm />
    </div>
  );
}
