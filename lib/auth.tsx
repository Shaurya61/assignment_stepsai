// lib/withAuth.js
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import React from 'react';

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkUser = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          router.push('/auth'); // Redirect to login page if not authenticated
        } else {
          setLoading(false);
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
