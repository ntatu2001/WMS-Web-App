import React from 'react';

const LoadingPage = () => {
  return (
    <div className ="fixed inset-0 w-full h-full bg-black/50 flex items-center justify-center z-[1000]">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" 
           style={{ animation: 'spin 1s linear infinite' }}>
      </div>
    </div>
  );
};

export default LoadingPage; 