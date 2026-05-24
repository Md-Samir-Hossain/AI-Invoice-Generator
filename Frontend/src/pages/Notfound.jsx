import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa";
import { MdSearchOff } from "react-icons/md";

const Notfound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob-2" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob-3" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Decorative icon with animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-blue-500 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            {/* Inner icon container */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shadow-lg">
              <div className="text-6xl text-indigo-600">
                <MdSearchOff />
              </div>
            </div>
          </div>
        </div>

        {/* 404 Number with invoice theme */}
        <div className="text-center mb-8">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 text-lg md:text-xl">
            <span>Page Not Found</span>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Oops! This Page Doesn't Exist
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Don't worry! Let's get you back to creating those invoices with EasyInvoice.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <FaArrowLeft className="text-lg" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <FaHome className="text-lg" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notfound;
