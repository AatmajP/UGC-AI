import type React from "react";
import type { Project } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GhostButton, PrimaryButton } from "./Buttons";
import { EllipsisIcon, ImageIcon, Loader2Icon, PlaySquareIcon, Share2Icon, Trash2Icon } from "lucide-react";
//

type ProjectCardProps = {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
  showActions?: boolean;
};

const ProjectCard = ({
  gen,
  setGenerations,
  forCommunity = false,
  showActions = !forCommunity,
}: ProjectCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const togglePublish = async (projectId: string) => {
    // TODO: Implement publish toggle logic
    console.log("Toggle publish for:", projectId);
  };


  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this project?');

    if (!confirm) return;

    console.log(id);
  };






  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">

        {/* preview */}
        <div
          className="relative overflow-hidden w-full bg-black/50"
          style={{ aspectRatio: gen.aspectRatio ? gen.aspectRatio.replace(':', '/') : '9/16' }}
        >

          {/* generated image */}
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${gen.generatedVideo
                ? "group-hover:opacity-0"
                : "group-hover:scale-105"
                }`}
            />
          )}

          {/* generated video */}
          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {/* loading overlay */}
          {!gen?.generatedImage && !gen?.generatedVideo && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20">
              <Loader2Icon className="size-7 animate-spin" />
            </div>
          )}

          {/* status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">
                Generating
              </span>
            )}

            {gen.isPublished && (
              <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                Published
              </span>
            )}
          </div>

          {/* (removed top-right aspect badge for community layout) */}
          {/* action menu for my generations only */}
          {showActions && (
            <div className="absolute top-3 right-3 z-10">
              <div
                className="bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-1.5 cursor-pointer transition text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
              >
                <EllipsisIcon className="size-5" />
              </div>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ImageIcon className="size-4" />
                      Download Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      <PlaySquareIcon className="size-4" />
                      Download Video
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          url: gen.generatedVideo || gen.generatedImage,
                          title: gen.productName,
                          text: gen.productDescription,
                        }).catch(console.error);
                      } else {
                        alert("Sharing is not supported on this browser");
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full flex gap-3 items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition text-left"
                  >
                    <Share2Icon className="size-4" />
                    Share
                  </button>

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="w-full flex gap-3 items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}


          {/* source images */}
          <div className="absolute right-3 bottom-3 flex">
            {gen.uploadedImages?.[0] && (
              <img
                src={gen.uploadedImages[0]}
                alt="product"
                className="w-16 h-16 object-cover rounded-full animate-float"
              />
            )}

            {gen.uploadedImages?.[1] && (
              <img
                src={gen.uploadedImages[1]}
                alt="model"
                className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
                style={{ animationDelay: "3s" }}
              />
            )}
          </div>

          {/* name + created overlay for community view */}
          {forCommunity && (
            <></>
          )}

        </div>

        {/* details section */}
        {forCommunity ? (
          <div className="p-4 space-y-3">
            {/* top: name, created date, aspect badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">{gen.name || gen.productName}</h3>
                {gen.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {typeof gen.createdAt === 'string' || typeof gen.createdAt === 'number'
                      ? new Date(gen.createdAt).toLocaleString()
                      : gen.createdAt?.toString()}
                  </p>
                )}
              </div>
              <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300 whitespace-nowrap">Aspect: {gen.aspectRatio}</span>
            </div>

            {/* description section */}
            {gen.productDescription && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                <div className="bg-black/40 border border-white/5 rounded-lg px-3 py-3">
                  <p className="text-xs text-gray-300 leading-relaxed">{gen.productDescription}</p>
                </div>
              </div>
            )}

            {/* user prompt */}
            {gen.userPrompt && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">{gen.userPrompt}</div>
              </div>
            )}

            {/* buttons */}
            {showActions && (
              <div className="mt-4 grid grid-cols-2 gap-3">

                <GhostButton
                  className="text-xs justify-center"
                  onClick={() => {
                    navigate(`/result/${gen.id}`);
                    scrollTo(0, 0);
                  }}
                >
                  View Details
                </GhostButton>

                <PrimaryButton
                  onClick={() => togglePublish(gen.id)}
                  className="rounded-md"
                >
                  {gen.isPublished ? 'Unpublish' : 'Publish'}
                </PrimaryButton>

              </div>
            )}

          </div>
        ) : (
          <div className="p-4">
            <h3 className="font-medium">{gen.name || gen.productName}</h3>

            {gen.productDescription && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {gen.productDescription}
              </p>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default ProjectCard;
