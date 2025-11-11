// src/components/DebugInfo.js (Temporary - remove in production)
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <strong>User Debug Info:</strong><br />
      UID: {user.uid}<br />
      Email: {user.email}<br />
      Role: <strong style={{color: 'yellow'}}>{user.role}</strong><br />
      Name: {user.name}<br />
      Full Data: {JSON.stringify(user)}
    </div>
  );
};

export default DebugInfo;