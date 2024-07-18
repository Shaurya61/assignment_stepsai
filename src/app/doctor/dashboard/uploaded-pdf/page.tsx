"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import withAuth from '../../../../../lib/auth';
import Link from 'next/link';

interface PDF {
  id: string;
  filepath: string;
  uploaddate: string;
  signedURL?: string; // Added signedURL to the PDF interface
}

const UploadedPDFs = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPDFs = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('uid', user.id)
          .single();

        if (doctorData) {
          const { data, error } = await supabase
            .from('pdfs')
            .select('*')
            .eq('doctor_id', doctorData.doctor_id);

          if (error) {
            console.error(error);
          } else {
            const pdfsWithSignedUrls = await Promise.all(data.map(async (pdf) => {
              const { data: signedData, error: signedError } = await supabase
                .storage
                .from('pdfs') // replace with your bucket name
                .createSignedUrl(pdf.filepath, 60); // URL valid for 60 seconds

              if (signedError) {
                console.error(signedError);
                return pdf; // return the original pdf if there's an error
              } else {
                return {
                  ...pdf,
                  signedURL: signedData.signedUrl,
                };
              }
            }));
            setPdfs(pdfsWithSignedUrls || []);
          }
        }
      }
      setLoading(false);
    };

    fetchPDFs();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white shadow-md py-4">
        <nav className="container mx-auto flex justify-between items-center px-6">
          <div className="text-xl font-bold">Dashboard</div>
          <ul className="flex space-x-6">
            <li>
              <Link href="/doctor/dashboard">
                <span className="hover:text-gray-300">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard/uploaded-pdf">
                <span className="hover:text-gray-300">PDF Uploads</span>
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
        <h1 className="text-3xl font-bold mb-6 text-black">Uploaded PDFs</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-black">
          {pdfs.length > 0 ? (
            <ul className="space-y-4">
              {pdfs.map((pdf) => (
                <li key={pdf.id} className="p-4 border border-gray-300 rounded-md hover:bg-gray-50">
                  <a href={pdf.signedURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {pdf.filepath.split('/').pop()}
                  </a>
                  <div className="text-gray-600">Uploaded on: {new Date(pdf.uploaddate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No PDFs uploaded yet.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(UploadedPDFs);
