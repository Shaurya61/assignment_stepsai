// pages/doctor/dashboard/index.tsx
"use client";
import LinkPatient from "@/components/LinkPatient";
import React from "react";
import Upload from "@/components/Upload";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const Dashboard = () => {
  const router = useRouter();

  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/");
    if (error) console.error("Signout error:", error);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <Header />
      <section className="container mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome to your dashboard
        </h1>
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

export default Dashboard;
