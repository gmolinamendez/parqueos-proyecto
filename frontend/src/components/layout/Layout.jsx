import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-bg">
      <Sidebar />
      <main className="ml-[260px] p-6">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}
