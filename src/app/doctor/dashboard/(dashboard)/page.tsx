import LinkPatient from '@/components/LinkPatient';
import React from 'react';
import Link from 'next/link';
import Upload from '@/components/Upload';

const Page = () => {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white shadow-md py-4">
        <nav className="container mx-auto flex justify-between items-center px-6">
          <div className="text-xl font-bold">Dashboard</div>
          <ul className="flex space-x-6">
            <li>
              <Link href="/doctor/dashboard/uploaded-pdf">
                <span className="hover:text-gray-300">pdf Uploads</span>
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard/linked-patients">
                <span className="hover:text-gray-300">All Linked Patients</span>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="container mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to your dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <Upload />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <LinkPatient />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
