import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toSlug } from "../utils/slug";

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id }) => {
  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      console.log("ProjectLink kosong");
      e.preventDefault();
      alert("Visit Link link is not available");
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      console.log("ID kosong");
      e.preventDefault();
      alert("Project details are not available");
    }
  };

  return (
    <Card className="group relative w-full overflow-hidden p-5 flex flex-col justify-between h-full">
      <div className="relative overflow-hidden rounded-lg mb-4 border-2 border-black/40">
        <img
          src={Img}
          alt={Title}
          className="w-full h-full object-cover aspect-[16/8] transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <CardHeader className="p-0 space-y-3 flex-1">
        <CardTitle>{Title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {Description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-0 pt-4 flex items-center justify-between mt-auto">
        {ProjectLink ? (
          <Button asChild variant="neutral" size="sm" className="px-4 py-2 text-sm">
            <a
              href={ProjectLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLiveDemo}
            >
              <span className="text-sm font-medium">Visit Link</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        ) : (
          <span className="text-gray-500 text-sm">
            Visit Link Not Available
          </span>
        )}

        {id ? (
          <Button asChild variant="neutral" size="sm" className="px-4 py-2 text-sm">
            <Link
              to={`/project/${toSlug(Title)}`}
              onClick={handleDetails}
            >
              <span className="text-sm font-medium">Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <span className="text-gray-500 text-sm">
            Details Not Available
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

CardProject.propTypes = {
  Img: PropTypes.string.isRequired,
  Title: PropTypes.string.isRequired,
  Description: PropTypes.string,
  Link: PropTypes.string,
  id: PropTypes.number.isRequired,
};

export default CardProject;
