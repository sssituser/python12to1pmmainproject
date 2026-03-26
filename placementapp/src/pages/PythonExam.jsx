import React from 'react';
import { Link } from 'react-router-dom';

const PythonExam = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 max-w-lg w-full text-center border border-white">
        <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">Python Exam Page</h2>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">
          The daily examination has been moved to the centralized <strong>Daily Assessment</strong> module for better organization.
        </p>
        <Link 
          to="/dashboard/daily-exam"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          Go to Daily Assessment
        </Link>
      </div>
    </div>
  );
};

export default PythonExam;
