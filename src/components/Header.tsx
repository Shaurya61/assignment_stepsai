// components/Header.tsx
"use client"
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import React, { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Signout error:", error);
  };

  return (
    <header className="bg-indigo-600 text-white p-4">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">Dashboard</div>
        <div className="hidden md:flex space-x-4">
          <Link href="/doctor/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/doctor/dashboard/uploaded-pdf" className="hover:underline">Uploaded PDFs</Link>
          <Link href="/doctor/dashboard/linked-patients" className="hover:underline">All Linked Patients</Link>
          <Link href="/" className="hover:underline">Signout</Link>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-indigo-600 w-64 p-6 space-y-4">
            <button onClick={closeMenu} className="focus:outline-none text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <Link href="/doctor/dashboard" className="block px-4 py-2 hover:underline">Dashboard</Link>
            <Link href="/doctor/dashboard/uploaded-pdf" className="block px-4 py-2 hover:underline">Uploaded PDFs</Link>
            <Link href="/doctor/dashboard/linked-patients" className="block px-4 py-2 hover:underline">All Linked Patients</Link>
            <Link href="/" className="block px-4 py-2 hover:underline" onClick={handleSignOut}>Signout</Link> 
          </div>
          <div className="flex-1" onClick={closeMenu}></div>
        </div>
      )}
    </header>
  );
};

export default Header;
