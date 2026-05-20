import React from "react";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ThankYouPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16" style={{ color: 'var(--color-primary-dark)' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
          Thank You!
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Your message has been received. I&apos;ll get back to you as soon as possible.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          style={{ backgroundImage: 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary-light))', boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;