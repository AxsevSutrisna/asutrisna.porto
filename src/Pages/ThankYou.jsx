import React from "react";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const ThankYouPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16" style={{ color: 'var(--color-primary-dark)' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
          Thank You!
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Your message has been received. I&apos;ll get back to you as soon as possible.
        </p>
        <Button asChild variant="default" size="lg" className="px-8 font-semibold">
          <Link to="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ThankYouPage;