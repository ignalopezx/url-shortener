import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Link to="/" className="font-bold">
            URL Shortener
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-600">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats/:code" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}
