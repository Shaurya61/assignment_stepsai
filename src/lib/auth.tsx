// lib/withAuth.tsx
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import React from 'react';

interface User {
  id: string;
}

const withAuth = (WrappedComponent: React.ComponentType, role: 'doctor' | 'patient') => {
  return (props: any) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkUser = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user: User | null = userData?.user || null;

        if (!user) {
          router.push('/'); // Redirect to login page if not authenticated
        } else {
          const { data: doctorData } = await supabase
            .from('doctors')
            .select('uid')
            .eq('uid', user.id);
          
          const { data: patientData } = await supabase
            .from('patients')
            .select('uid')
            .eq('uid', user.id);

          const isDoctor = doctorData && doctorData.length > 0;
          const isPatient = patientData && patientData.length > 0;

          if ((role === 'doctor' && !isDoctor) || (role === 'patient' && !isPatient)) {
            router.push('/'); // Redirect to home if the user is not authorized
          } else {
            setLoading(false);
          }
        }
      };

      checkUser();
    }, []);

    if (loading) {
      return <div>Loading...</div>; 
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
