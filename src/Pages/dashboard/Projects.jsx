import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabase";
import {
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Pencil,
} from "lucide-react";
import { MAX_PROJECT_IMAGES, getPrimaryProjectImage, normalizeProjectImages } from "../../utils/projectImages";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10" />
    <div className="relative bg-white/5 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
      <div className="w-full aspect-[16/8] bg-white/5 animate-pulse rounded-xl" />
      <div className="h-4 bg-white/5 animate-pulse rounded-lg w-2/3" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-full" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-4/5" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-5 w-16 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-12 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-20 bg-white/5 animate-pulse rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/8 mt-auto">
        <div className="flex gap-2">
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-14 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-16 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, onDelete, onEdit }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const primaryImage = getPrimaryProjectImage(project);
  const imageCount = normalizeProjectImages(project).length;

  useEffect(() => {
    setImgLoaded(false);
  }, [primaryImage]);

  return (
    <Card>
      <div className="p-4 flex flex-col h-full">
        {primaryImage && (
          <div className="w-full aspect-[16/8] rounded-xl mb-4 border border-white/8 overflow-hidden bg-white/5">
            {!imgLoaded && (
              <div className="w-full h-full animate-pulse bg-white/5" />
            )}
            <img
              src={primaryImage}
              alt={project.Title || project.title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            />
            {imageCount > 1 && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-white">
                +{imageCount - 1} more
              </div>
            )}
          </div>
        )}
        <h3 className="font-semibold text-white text-sm mb-1">
          {project.Title || project.title}
        </h3>
        {(project.Description || project.description) && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
            {project.Description || project.description}
          </p>
        )}
        {(project.TechStack || project.techstack || project.tech_stack)?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(project.TechStack || project.techstack || project.tech_stack).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-white/8">
          <div className="flex gap-2">
            {project.Link && (
              <a
                href={project.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.Github && (
              <a
                href={project.Github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 text-xs transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div
      className="relative z-10 w-full max-w-2xl flex flex-col"
      style={{ maxHeight: "calc(100vh - 24px)" }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
  uploading,
}) => {
  const imageItemsRef = useRef([]);
  const [form, setForm] = useState({
    title: initial?.title || initial?.Title || "",
    description: initial?.description || initial?.Description || "",
    techstack: Array.isArray(initial?.tech_stack)
      ? initial.tech_stack.join(", ")
      : Array.isArray(initial?.techstack)
        ? initial.techstack.join(", ")
        : Array.isArray(initial?.TechStack)
          ? initial.TechStack.join(", ")
          : initial?.techstack || initial?.TechStack || initial?.tech_stack || "",
    features: Array.isArray(initial?.features)
      ? initial.features.join(", ")
      : Array.isArray(initial?.Features)
        ? initial.Features.join(", ")
        : initial?.features || initial?.Features || "",
    link: initial?.link || initial?.Link || "",
    github: initial?.github || initial?.Github || "",
  });
  const [imageItems, setImageItems] = useState(() =>
    normalizeProjectImages(initial).map((src, index) => ({
      id: `${src}-${index}`,
      src,
      file: null,
      existing: true,
    }))
  );

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = MAX_PROJECT_IMAGES - imageItems.length;
    const selectedFiles = files.slice(0, remainingSlots);

    const nextImages = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      file,
      existing: false,
    }));

    setImageItems((current) => [...current, ...nextImages]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImageItems((current) => {
      const item = current[index];
      if (item && !item.existing) {
        URL.revokeObjectURL(item.src);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const setPrimaryImage = (index) => {
    setImageItems((current) => {
      if (index <= 0 || index >= current.length) return current;
      const next = [...current];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      imageItemsRef.current.forEach((item) => {
        if (!item.existing) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, imageItems);
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Project Title"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. My Portfolio Website"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Describe what this project does, its purpose, and impact..."
            rows={3}
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        <InputField
          label="Tech Stack (comma separated)"
          value={form.techstack}
          onChange={set("techstack")}
          placeholder="e.g. React, Tailwind, Supabase"
        />
        <InputField
          label="Key Features (comma separated)"
          value={form.features}
          onChange={set("features")}
          placeholder="e.g. Auth, Dark mode, REST API"
        />
        <InputField
          label="Live URL"
          value={form.link}
          onChange={set("link")}
          placeholder="https://yourproject.com"
        />
        <InputField
          label="GitHub URL"
          value={form.github}
          onChange={set("github")}
          placeholder="https://github.com/username/repo"
        />

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            Project Image
          </label>
          <div className="space-y-3">
            <label className={`flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 transition-all ${imageItems.length >= MAX_PROJECT_IMAGES ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-indigo-500/40 hover:bg-white/4"}`}>
              <div className="w-24 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                {imageItems.length > 0 ? (
                  <img
                    src={imageItems[0].src}
                    className="w-full h-full object-cover"
                    alt="primary preview"
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">
                  {imageItems.length > 0 ? "Add more images" : "Click to upload images"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  PNG, JPG, WEBP supported. Max {MAX_PROJECT_IMAGES} images.
                </p>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {imageItems.length}/{MAX_PROJECT_IMAGES}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={imageItems.length >= MAX_PROJECT_IMAGES}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {imageItems.map((item, index) => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d0d22]">
                    <img src={item.src} alt={`project-${index + 1}`} className="w-full h-32 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-white font-medium">{index === 0 ? "Primary" : `Image ${index + 1}`}</p>
                        <p className="text-[10px] text-gray-300 truncate">{item.existing ? "Current image" : item.file?.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white hover:bg-white/20 transition-colors"
                          >
                            Make primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1.5 rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="relative group/s">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
          <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-sm text-gray-200">
              {uploading ? "Saving..." : submitLabel}
            </span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const uploadImage = async (f) => {
    const fileName = `${Date.now()}-${f.name}`;
    await supabase.storage.from("project-images").upload(fileName, f);
    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadProjectImages = async (imageItems) => {
    const resolvedImages = await Promise.all(
      imageItems.slice(0, MAX_PROJECT_IMAGES).map(async (item) => {
        if (item.file) {
          return uploadImage(item.file);
        }
        return item.src;
      })
    );

    return resolvedImages.filter(Boolean).slice(0, MAX_PROJECT_IMAGES);
  };

  const handleCreate = async (form, imageItems) => {
    setUploading(true);
    const imageUrls = await uploadProjectImages(imageItems);
    const primaryImage = imageUrls[0] || "";
    await supabase.from("projects").insert({
      title: form.title,
      description: form.description,
      img: primaryImage,
      images: imageUrls,
      tech_stack: form.techstack.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      link: form.link,
      github: form.github,
    });
    setShowCreate(false);
    setUploading(false);
    fetchProjects();
  };

  const handleEdit = async (form, imageItems) => {
    setUploading(true);
    const imageUrls = await uploadProjectImages(imageItems);
    const primaryImage = imageUrls[0] || "";
    await supabase
      .from("projects")
      .update({
        title: form.title,
        description: form.description,
        img: primaryImage,
        images: imageUrls,
        tech_stack: form.techstack.split(",").map((s) => s.trim()).filter(Boolean),
        features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
        link: form.link,
        github: form.github,
      })
      .eq("id", editProject.id);
    setEditProject(null);
    setUploading(false);
    fetchProjects();
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  };

  return (
    <div className="space-y-6z ">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
            <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Projects
            </h1>
            <p className="text-gray-500 text-xs">
              {loading ? "Loading..." : `${projects.length} projects total`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="relative group shrink-0"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
          <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-gray-200">New Project</span>
          </div>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add New Project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(null)}>
          <ProjectForm
            initial={editProject}
            onSubmit={handleEdit}
            onCancel={() => setEditProject(null)}
            submitLabel="Update Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <FolderGit2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No projects yet. Create your first one!
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              onEdit={setEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
