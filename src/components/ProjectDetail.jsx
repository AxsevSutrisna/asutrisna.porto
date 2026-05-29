import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Code2,
  Star,
  ChevronRight,
  Layers,
  Layout,
  Globe,
  Package,
  Cpu,
  Code,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { toSlug } from "../utils/slug";
import { normalizeProjectImages } from "../utils/projectImages";
import {
  buildCreativeWorkSchema,
  buildPersonSchema,
  buildWebPageSchema,
  resolveAbsoluteUrl,
  resolveSiteUrl,
  serializeJsonLd,
} from "../utils/seoSchema";
import { Button } from "./ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const TECH_ICONS = {
  React: Globe,
  Tailwind: Layout,
  Express: Cpu,
  Python: Code,
  Javascript: Code,
  HTML: Code,
  CSS: Code,
  default: Package,
};

const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];
  return (
    <div
      className="group relative overflow-hidden px-3 py-2 md:px-4 md:py-2.5 rounded-xl border hover:border-[color:var(--color-primary-light)] transition-all duration-300 cursor-default"
      style={{
        background: 'linear-gradient(to right, rgba(var(--color-primary-dark-rgb), 0.1), rgba(var(--color-primary-light-rgb), 0.1))',
        borderColor: 'rgba(var(--color-primary-light-rgb), 0.2)'
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: 'linear-gradient(to right, rgba(var(--color-primary-dark-rgb), 0.15), rgba(var(--color-primary-light-rgb), 0.15))'
        }}
      />
      <div className="relative flex items-center gap-1.5 md:gap-2">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 transition-colors" style={{ color: 'var(--color-primary-light)' }} />
        <span className="text-xs md:text-sm font-medium transition-colors" style={{ color: 'var(--color-primary-light)' }}>
          {tech}
        </span>
      </div>
    </div>
  );
};

const FeatureItem = ({ feature }) => {
  return (
    <li className="group flex items-start space-x-3 p-2.5 md:p-3.5 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-[color:var(--color-border-light)]">
      <div className="relative mt-2">
        <div
          className="absolute -inset-1 rounded-full blur group-hover:opacity-30 opacity-0 transition-opacity duration-300 bg-[color:var(--color-text-secondary)]"
        />
        <div
          className="relative w-1.5 h-1.5 md:w-2 md:h-2 rounded-full group-hover:scale-125 transition-transform duration-300 bg-[color:var(--color-text-secondary)]"
        />
      </div>
      <span className="text-sm md:text-base transition-colors group-hover:text-white" style={{ color: 'var(--color-text-secondary)' }}>
        {feature}
      </span>
    </li>
  );
};

const ProjectStats = ({ project }) => {
  const techStackCount = project?.TechStack?.length || 0;
  const featuresCount = project?.Features?.length || 0;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 rounded-xl overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-backdrop-glow)' }}
    >
      <div
        className="absolute inset-0 opacity-50 blur-2xl z-0"
        style={{ background: 'linear-gradient(to bottom right, rgba(var(--color-primary-dark-rgb), 0.2), rgba(var(--color-primary-light-rgb), 0.2))' }}
      />
      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-[color:var(--color-border-light)] transition-all duration-300 hover:scale-105 hover:border-[color:var(--color-primary-light)] hover:shadow-lg">
        <div className="p-1.5 md:p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary-dark-rgb), 0.2)' }}>
          <Code2
            className="w-4 h-4 md:w-6 md:h-6"
            style={{ color: 'var(--color-primary-light)' }}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-white/90">
            {techStackCount}
          </div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Total Teknologi
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-[color:var(--color-border-light)] transition-all duration-300 hover:scale-105 hover:border-[color:var(--color-primary-light)] hover:shadow-lg">
        <div className="p-1.5 md:p-2 rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary-light-rgb), 0.2)' }}>
          <Layers
            className="w-4 h-4 md:w-6 md:h-6"
            style={{ color: 'var(--color-primary-light)' }}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-white/90">
            {featuresCount}
          </div>
          <div className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Fitur Utama
          </div>
        </div>
      </div>
    </div>
  );
};

const handleGithubClick = (githubLink) => {
  if (githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "Maaf, source code untuk proyek ini bersifat privat.",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#3085d6",
      background: "#030014",
      color: "#ffffff",
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState(typeof window !== 'undefined' ? window.location.origin : 'https://asutrisna-porto.vercel.app/');
  const [fullScreenImage, setFullScreenImage] = useState(null);


  useEffect(() => {
    window.scrollTo(0, 0);
    let mounted = true

    const fetchProjectFromDb = async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*')
        if (error) throw error

        const projects = data || []
        // cari by slug
        const found = projects.find((p) => toSlug(p?.title || p?.Title) === slug)
        if (found && mounted) {
          const normalizedTitle = found.title || found.Title || "Untitled Project"
          const normalizedDescription = found.description || found.Description || ""
          const normalizedFeatures = Array.isArray(found.features)
            ? found.features
            : (typeof found.features === 'string' && found.features.length > 0)
              ? found.features.split(',').map((s) => s.trim()).filter(Boolean)
              : Array.isArray(found.Features)
                ? found.Features
                : (typeof found.Features === 'string' && found.Features.length > 0)
                  ? found.Features.split(',').map((s) => s.trim()).filter(Boolean)
                  : []
          const normalizedTechStack = Array.isArray(found.tech_stack)
            ? found.tech_stack
            : Array.isArray(found.techstack)
              ? found.techstack
              : (typeof found.techstack === 'string' && found.techstack.length > 0)
                ? found.techstack.split(',').map((s) => s.trim()).filter(Boolean)
                : Array.isArray(found.TechStack)
                  ? found.TechStack
                  : (typeof found.TechStack === 'string' && found.TechStack.length > 0)
                    ? found.TechStack.split(',').map((s) => s.trim()).filter(Boolean)
                    : []
          const normalizedImages = normalizeProjectImages(found)

          const enhanced = {
            ...found,
            Title: normalizedTitle,
            Description: normalizedDescription,
            Img: found.img || found.Img || "",
            Images: normalizedImages,
            Link: found.link || found.Link || "#",
            Github: found.github || found.Github || "https://github.com/AxsevSutrisna",
            Features: normalizedFeatures,
            TechStack: normalizedTechStack,
          }

          setProject(enhanced)
          setIsResolved(true)
          return
        }

        // fallback to localStorage if not found in DB
        const storedProjects = JSON.parse(localStorage.getItem("projects")) || []
        const selectedProject = storedProjects.find(
          (p) => toSlug(p?.title || p?.Title) === slug,
        )

        if (selectedProject && mounted) {
          const normalizedTitle = selectedProject.title || selectedProject.Title || "Untitled Project"
          const normalizedDescription = selectedProject.description || selectedProject.Description || ""
          const normalizedFeatures = Array.isArray(selectedProject.features)
            ? selectedProject.features
            : Array.isArray(selectedProject.Features)
              ? selectedProject.Features
              : []
          const normalizedTechStack = Array.isArray(selectedProject.tech_stack)
            ? selectedProject.tech_stack
            : Array.isArray(selectedProject.TechStack)
              ? selectedProject.TechStack
              : []
          const normalizedImages = normalizeProjectImages(selectedProject)

          const enhancedProject = {
            ...selectedProject,
            Title: normalizedTitle,
            Description: normalizedDescription,
            Img: selectedProject.img || selectedProject.Img || "",
            Images: normalizedImages,
            Link: selectedProject.link || selectedProject.Link || "#",
            Github: selectedProject.github || selectedProject.Github || "https://github.com/AxsevSutrisna",
            Features: normalizedFeatures,
            TechStack: normalizedTechStack,
          }
          setProject(enhancedProject)
        } else {
          setProject(null)
        }

        setIsResolved(true)
      } catch (err) {
        console.error('Error fetching project:', err.message || err)
        // try localStorage fallback
        const storedProjects = JSON.parse(localStorage.getItem("projects")) || []
        const selectedProject = storedProjects.find(
          (p) => toSlug(p?.title || p?.Title) === slug,
        )
        if (selectedProject && mounted) {
          const normalizedTitle = selectedProject.title || selectedProject.Title || "Untitled Project"
          const normalizedDescription = selectedProject.description || selectedProject.Description || ""
          const normalizedFeatures = Array.isArray(selectedProject.features)
            ? selectedProject.features
            : Array.isArray(selectedProject.Features)
              ? selectedProject.Features
              : []
          const normalizedTechStack = Array.isArray(selectedProject.tech_stack)
            ? selectedProject.tech_stack
            : Array.isArray(selectedProject.TechStack)
              ? selectedProject.TechStack
              : []
          const normalizedImages = normalizeProjectImages(selectedProject)

          const enhancedProject = {
            ...selectedProject,
            Title: normalizedTitle,
            Description: normalizedDescription,
            Img: selectedProject.img || selectedProject.Img || "",
            Images: normalizedImages,
            Link: selectedProject.link || selectedProject.Link || "#",
            Github: selectedProject.github || selectedProject.Github || "https://github.com/AxsevSutrisna",
            Features: normalizedFeatures,
            TechStack: normalizedTechStack,
          }
          setProject(enhancedProject)
        } else if (mounted) {
          setProject(null)
        }
        if (mounted) setIsResolved(true)
      }
    }

    fetchProjectFromDb()

    return () => { mounted = false }
  }, [slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin)
    }
  }, [])

  if (!isResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <h2 className="text-xl md:text-3xl font-bold text-white">
            Loading Project...
          </h2>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Project not found</h2>
          <p className="text-gray-400">Data project tidak ditemukan atau slug tidak valid.</p>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="px-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const projectUrl = resolveSiteUrl(siteOrigin, `/project/${toSlug(project.Title)}`);
  const projectImages = normalizeProjectImages(project);
  const heroImage = projectImages[0] || project.img || project.Img;
  const jsonLdSchemas = [
    buildWebPageSchema({
      name: `${project.Title} — Asep Sutrisna Suhada Putra`,
      url: projectUrl,
      description: project.Description?.slice(0, 155) || `Project ${project.Title} oleh Asep Sutrisna Suhada Putra.`,
      primaryImageOfPage: resolveAbsoluteUrl(heroImage, projectUrl),
      about: {
        '@type': 'CreativeWork',
        name: project.Title,
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'asutrisnadev',
        url: resolveSiteUrl(siteOrigin),
      },
      author: {
        '@type': 'Person',
        name: 'Asep Sutrisna Suhada Putra',
      },
    }),
    buildCreativeWorkSchema({
      name: project.Title,
      description: project.Description?.slice(0, 155) || `Project ${project.Title} oleh Asep Sutrisna Suhada Putra.`,
      url: projectUrl,
      image: resolveAbsoluteUrl(heroImage, projectUrl),
      author: buildPersonSchema({
        name: 'Asep Sutrisna Suhada Putra',
        url: resolveSiteUrl(siteOrigin),
      }),
    }),
  ]

  return (
    <>
      <Helmet>
        <title>{project.Title} — Asep Sutrisna Suhada Putra</title>
        <meta
          name="description"
          content={
            project.Description
              ? project.Description.slice(0, 155)
              : `Project ${project.Title} oleh Asep Sutrisna Suhada Putra — Full-Stack Web Developer.`
          }
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={projectUrl} />
        <meta
          property="og:title"
          content={`${project.Title} — Asep Sutrisna Suhada Putra`}
        />
        <meta
          property="og:description"
          content={project.Description?.slice(0, 155)}
        />
        <meta property="og:url" content={projectUrl} />
        <meta property="og:type" content="website" />
        {heroImage && <meta property="og:image" content={heroImage} />}
        {jsonLdSchemas.map((schema) => (
          <script key={`${schema['@type']}-${schema.name || schema.url || 'schema'}`} type="application/ld+json">
            {serializeJsonLd(schema)}
          </script>
        ))}
      </Helmet>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors no-neo"
            onClick={() => setFullScreenImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullScreenImage}
            alt="Full View"
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/20 shadow-2xl animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="min-h-screen px-[2%] sm:px-0 relative overflow-hidden" style={{ backgroundColor: 'var(--color-backdrop-base)' }}>
        <div className="fixed inset-0">
          <div className="absolute -inset-[10px] opacity-20">
            <div className="absolute top-0 -left-4 w-72 md:w-96 h-72 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ backgroundColor: 'var(--color-primary-dark)' }} />
            <div className="absolute top-0 -right-4 w-72 md:w-96 h-72 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" style={{ backgroundColor: 'var(--color-primary-light)' }} />
            <div className="absolute -bottom-8 left-20 w-72 md:w-96 h-72 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" style={{ backgroundColor: 'var(--color-primary-dark)' }} />
          </div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8 md:mb-12 animate-fadeIn min-w-0">
              <Button
                onClick={() => navigate(-1)}
                variant="neutral"
                size="sm"
                className="group inline-flex items-center justify-center space-x-1.5 md:space-x-2 px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-base w-fit shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </Button>
              <Breadcrumb className="flex min-w-0 items-center">
                <BreadcrumbList className="flex-nowrap sm:gap-2">
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate(-1)} className="text-white/50 hover:text-[color:var(--color-primary-light)] transition-colors cursor-pointer text-sm md:text-base shrink-0 font-normal">
                      Projects
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/50 [&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4 shrink-0" />
                  <BreadcrumbItem className="min-w-0 truncate">
                    <BreadcrumbPage className="text-white/90 font-medium text-sm md:text-base min-w-0 truncate block">
                      {project.Title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-6 md:space-y-10 animate-slideInLeft">
                <div className="space-y-4 md:space-y-6">
                  <h1
                    className="text-3xl md:text-6xl font-bold leading-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {project.Title}
                  </h1>
                  <div className="relative h-1 w-16 md:w-24">
                    <div className="absolute inset-0 rounded-full animate-pulse" style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary-dark), var(--color-primary-light))' }} />
                    <div className="absolute inset-0 rounded-full blur-sm" style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary-dark), var(--color-primary-light))' }} />
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {project.Description}
                  </p>
                </div>

                <ProjectStats project={project} />

                <div className="flex flex-wrap gap-3 md:gap-4">
                  <Button
                    asChild
                    variant="neutral"
                    size="default"
                    className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 text-sm md:text-base overflow-hidden"
                  >
                    <a href={project.Link} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center space-x-1.5 md:space-x-2">
                      <ExternalLink className="relative w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                      <span className="relative font-medium">Visit Link</span>
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="neutral"
                    size="default"
                    className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 text-sm md:text-base overflow-hidden"
                  >
                    <a
                      href={project.Github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center space-x-1.5 md:space-x-2"
                      onClick={(e) => {
                        if (!handleGithubClick(project.Github)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Github className="relative w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                      <span className="relative font-medium">Github</span>
                    </a>
                  </Button>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white/90 mt-[3rem] md:mt-0 flex items-center gap-2 md:gap-3">
                    <Code2 className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--color-primary-light)' }} />
                    Technologies Used
                  </h3>
                  {project.TechStack?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {(project.TechStack || []).map((tech, index) => (
                        <TechBadge key={index} tech={tech} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm md:text-base text-gray-400 opacity-50">
                      No technologies added.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6 md:space-y-10 animate-slideInRight">
                <div className="space-y-4">
                  <div
                    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-white/5 cursor-pointer"
                    onClick={() => heroImage && setFullScreenImage(heroImage)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {heroImage ? (
                      <img
                        src={heroImage}
                        alt={project.Title || project.title}
                        className="w-full object-cover transform transition-transform duration-700 will-change-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full min-h-[260px] md:min-h-[360px] flex items-center justify-center text-gray-500">
                        No project image available
                      </div>
                    )}
                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors duration-300 rounded-2xl" />
                  </div>

                  {projectImages.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {projectImages.slice(1).map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          onClick={() => setFullScreenImage(image)}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 aspect-[16/10] min-w-0"
                        >
                          <img
                            src={image}
                            alt={`${project.Title} image ${index + 2}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Card className="group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-400 group-hover:rotate-[20deg] transition-transform duration-300" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.Features?.length > 0 ? (
                      <ul className="list-none space-y-2">
                        {(project.Features || []).map((feature, index) => (
                          <FeatureItem key={index} feature={feature} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[color:var(--color-text-secondary)] opacity-50">
                        No features added.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 10s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-fadeIn {
            animation: fadeIn 0.7s ease-out;
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.7s ease-out;
          }
          .animate-slideInRight {
            animation: slideInRight 0.7s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-zoomIn {
            animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProjectDetails;
