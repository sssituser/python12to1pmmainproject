// Temporary file to resolve import error
// This component is no longer used but kept to prevent build errors
import React from "react";

const ExamFailed = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          This page is no longer used
        </h1>
        <p className="text-gray-600">
          Redirecting to results page...
        </p>
      </div>
    </div>
  );
};

export default ExamFailed;
