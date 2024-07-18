"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from 'next/navigation';
import withAuth from "../../../lib/auth";

const Upload = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("User error:", userError);
      return;
    }

    const user = userData.user;
    console.log("Authenticated user:", user);

    // Query the doctors table to get the doctor_id
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('uid', user.id);

    if (doctorError || !doctorData || doctorData.length !== 1) {
      console.error("Doctor query error or no/multiple matching doctor found:", doctorError);
      return;
    }

    const doctor_id = doctorData[0].doctor_id;
    console.log("Doctor ID:", doctor_id);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(`pdfs/${doctor_id}/${file.name}`, file);
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }
    console.log("File uploaded:", uploadData);

    // Insert file details into database
    const { error: dbError } = await supabase.from("pdfs").insert({
      doctor_id: doctor_id,
      filepath: uploadData?.path,
      uploaddate: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
    } else {
      console.log("File details inserted into database");
    }
  };

  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    router.push('/auth');
    if (error) console.error("Signout error:", error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Upload PDF
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
          <div>
            <button
              onClick={handleUpload}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Upload
            </button>
            <button onClick={handleSignout} className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              Signout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Upload);
