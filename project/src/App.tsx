import React from 'react';
import EmailEditor from './components/EmailEditor';
import { Mail } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Email Builder
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Create beautiful email templates in minutes
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <EmailEditor />
      </main>
    </div>
  );
}

export default App;