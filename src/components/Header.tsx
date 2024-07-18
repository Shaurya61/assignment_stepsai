import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <header className="bg-indigo-600 text-white p-4">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">Dashboard</div>
        <div className="space-x-4">
          <Link href="/doctor/dashboard/profile" className="hover:underline">Profile</Link>
          <Link href="/doctor/dashboard/past-uploads" className="hover:underline">Past Uploads</Link>
          <Link href="/doctor/dashboard/linked-patients" className="hover:underline">All Linked Patients</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
