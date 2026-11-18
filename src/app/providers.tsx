import React from 'react';
import { ShowroomAuthProvider, useShowroomAuth } from '../context/ShowroomAuthContext';
import { GlassShowroomGate } from '../components/auth/GlassShowroomGate';

interface ProvidersProps {
  children: React.ReactNode;
}

const ProtectedShowroomContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnlocked } = useShowroomAuth();

  if (!isUnlocked) {
    return <GlassShowroomGate />;
  }

  return <>{children}</>;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ShowroomAuthProvider>
      <ProtectedShowroomContent>{children}</ProtectedShowroomContent>
    </ShowroomAuthProvider>
  );
};

