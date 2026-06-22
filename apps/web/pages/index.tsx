import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <Head>
        <title>LostInVirtual | Resident Registry</title>
      </Head>
      
      <main className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          LostInVirtual
        </h1>
        <p className="text-xl text-gray-400">
          The digital frontier's premier citizen registry. Claim your identity, secure your status, and become part of the ecosystem.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
            Get Resident Card
          </button>
          <button className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-semibold transition-all">
            Login
          </button>
        </div>
      </main>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        © 2026 LostInVirtual Registry. Secure. Sovereign.
      </footer>
    </div>
  );
}
