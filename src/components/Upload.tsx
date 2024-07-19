"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';
import withAuth from "@/lib/auth";

const Upload = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("User error:", userError);
      return;
    }

    const user = userData.user;
    console.log("Authenticated user:", user);

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

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(`pdfs/${doctor_id}/${file.name}`, file);
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }
    console.log("File uploaded:", uploadData);

    const { error: dbError } = await supabase.from("pdfs").insert({
      doctor_id: doctor_id,
      filepath: uploadData?.path,
      uploaddate: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
    } else {
      console.log("File details inserted into database");
      setSuccessMessage(`${file.name} uploaded successfully`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-center text-2xl font-extrabold text-gray-900">
          Upload PDF
        </h2>
      </div>
      <div className="space-y-6 text-black">
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
        </div>
        {successMessage && (
          <div className="mt-4 text-green-600">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(Upload, 'doctor');
