import React, { useState } from 'react';
import { Eye, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const ProjectCardModal = ({ title, description, link }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center space-x-1 px-3 py-1.5"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-sm">Details</span>
        <ArrowRight className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 text-white shadow-lg animate-slide-up sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-md p-2"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="h-5 w-5" />
            </Button>
            <h2 className="mb-4 text-2xl font-bold">{title}</h2>
            <p className="mb-6 text-gray-400">{description}</p>
            <div className="flex justify-end space-x-4">
              <Button asChild variant="default" size="default" className="rounded-md px-4 py-2 font-medium">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Visit Link <ExternalLink className="ml-2 inline-block h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="neutral"
                size="default"
                className="rounded-md px-4 py-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCardModal;