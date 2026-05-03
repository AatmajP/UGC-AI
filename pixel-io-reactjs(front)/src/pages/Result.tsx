import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project } from "../types";

import { Loader2Icon, Video, ImageIcon, RotateCcw } from "lucide-react";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { motion } from "framer-motion";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import type { dummyGenerations } from "../assets/assets";
import api from "../configs/axios";

const Result = () => {
  const { projectId } = useParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [project, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    try {
      if (!projectId) {
        console.warn("fetchProjectData: projectId is missing");
        return;
      }

      const token = await getToken();
      if (!token) {
        console.error("fetchProjectData: Failed to get token");
        setError("Authentication token unavailable");
        return;
      }

      console.log("Fetching project data for:", projectId);
      const { data } = await api.get(`/api/user/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Project data fetched:", data);
      setProjectData(data.project);
      setIsGeneratingVideo(data.project.isGenerating);
      setVideoGenerated(!!data.project.generatedVideo);
      setLoading(false);
      setError(null);

    } catch (error: any) {
      console.error("fetchProjectData error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to load project";
      setError(errorMsg);
      if (loading) {
        toast.error(errorMsg);
      }
    }
  };

const handleGenerateVideo = async () => {
  console.log("=== Generate Video Button Clicked ===");
  console.log({ isGeneratingVideo, videoGenerated, projectId, hasProject: !!project });

  // Validation checks
  if (!projectId) {
    const msg = "Project ID is missing";
    console.error(msg);
    toast.error(msg);
    return;
  }

  if (!project) {
    const msg = "Project data not loaded";
    console.error(msg);
    toast.error(msg);
    return;
  }

  if (isGeneratingVideo) {
    console.warn("Video generation already in progress");
    return;
  }

  setIsGeneratingVideo(true);
  setError(null);

  try {
    console.log("Step 1: Getting authentication token...");
    const token = await getToken();

    if (!token) {
      throw new Error("No authentication token available. Please sign in again.");
    }
    console.log("Step 1 ✓: Token obtained");

    console.log("Step 2: Calling API endpoint /api/project/video");
    console.log({ projectId, endpoint: "/api/project/video", method: "POST" });

    const response = await api.post(
      "/api/project/video",
      { projectId },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 600000 // 10 minutes
      }
    );

    const data = response.data;
    console.log("Step 2 ✓: API Response received:", data);

    if (!data.videoUrl) {
      throw new Error("Video URL not received from server");
    }

    console.log("Step 3: Updating local state with video URL");
    setProjectData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        generatedVideo: data.videoUrl
      };
    });

    setVideoGenerated(true);
    setIsGeneratingVideo(false);
    console.log("Step 3 ✓: State updated successfully");

    toast.success(data.message || "✨ Video generated successfully!");
    console.log("=== Video Generation Complete ===");

  } catch (error: any) {
    console.error("=== Video Generation Failed ===");
    console.error("Error Details:", {
      name: error?.name,
      message: error?.message,
      response: error?.response?.status,
      data: error?.response?.data,
      code: error?.code,
      isAxiosError: error?.isAxiosError
    });

    setIsGeneratingVideo(false);

    // Determine the best error message
    let errorMsg = "Failed to generate video";

    if (error?.response?.status === 401) {
      errorMsg = "Authentication failed. Please sign in again.";
    } else if (error?.response?.status === 402) {
      errorMsg = "Insufficient credits to generate video.";
    } else if (error?.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (error?.code === "ECONNABORTED") {
      errorMsg = "Request timeout. Video generation is taking longer than expected.";
    }

    setError(errorMsg);
    toast.error(errorMsg);
  }
};

  // Initial load and auth check
  useEffect(() => {
    console.log("useEffect: Auth state changed", { isLoaded, userExists: !!user });

    if (!isLoaded) {
      console.log("Waiting for Clerk to load...");
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to home");
      navigate("/");
      return;
    }

    if (!project && !loading) {
      console.log("Fetching project data after auth confirmed");
      fetchProjectData();
    }
  }, [isLoaded, user]); // Removed navigate from deps to prevent re-renders

  // Poll for video generation progress
  useEffect(() => {
    console.log("useEffect: Polling setup", { isGeneratingVideo, projectId });

    if (!isGeneratingVideo || !projectId || !user) {
      return;
    }

    console.log("Starting video generation polling...");
    const interval = setInterval(() => {
      console.log("Polling for video generation status...");
      fetchProjectData();
    }, 5000); // Check every 5 seconds

    return () => {
      console.log("Stopping video generation polling");
      clearInterval(interval);
    };
  }, [isGeneratingVideo, projectId, user]);

  if (loading || !project) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          {error ? (
            <>
              <div className="text-red-400 text-center">
                <p className="font-semibold">Error Loading Project</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </>
          ) : (
            <>
              <Loader2Icon className="animate-spin text-indigo-500 size-10" />
              <p className="text-gray-400 text-sm animate-pulse">Loading your masterpiece...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto mt-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Generation Result</h1>
          <GhostButton
            onClick={() => navigate("/generate")}
            className="flex items-center gap-2 bg-white/5 border-white/10 px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <RotateCcw className="size-4" />
            New Generation
          </GhostButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Preview (Large) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] w-full bg-gray-900/40 rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl"
            >
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2Icon className="size-10 text-gray-700 animate-spin" />
                </div>
              )}

              {videoGenerated && project.generatedVideo ? (
                <video
                  src={project.generatedVideo}
                  poster={project.generatedImage}
                  controls
                  loop
                  playsInline
                  autoPlay
                  className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoadedData={() => setImageLoaded(true)}
                />
              ) : (
                <img
                  src={project.generatedImage}
                  alt={project.productName}
                  className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
            </motion.div>
          </div>

          {/* Right Column - Actions & Options */}
          <div className="lg:col-span-5 space-y-6">

            {/* Actions Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="text-xl font-semibold">Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = project.generatedImage || "";
                    link.download = `pixel-io-${project.id}.png`;
                    link.click();
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-2xl py-4 font-medium"
                >
                  <ImageIcon className="size-5 text-gray-400" />
                  Download Image
                </button>
                <button
                  onClick={() => {
                    if (project.generatedVideo) {
                      const link = document.createElement('a');
                      link.href = project.generatedVideo;
                      link.download = `pixel-io-${project.id}.mp4`;
                      link.click();
                    }
                  }}
                  disabled={!videoGenerated}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-2xl py-4 font-medium"
                >
                  <Video className="size-5 text-gray-400" />
                  Download Video
                </button>
              </div>
            </div>

            {/* Video Magic Card */}
            <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-xl group transition-all duration-500 ${videoGenerated ? 'ring-1 ring-emerald-500/30 bg-emerald-500/[0.02]' : ''}`}>
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">Video Magic</h3>
                  <Video className={`size-5 transition-colors duration-500 ${videoGenerated ? 'text-emerald-400' : 'text-indigo-400'}`} />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
                  Turn this static image into a dynamic video for social media.
                </p>

                {videoGenerated ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full py-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold text-center text-sm tracking-wide"
                  >
                    Video Generated Successfully!
                  </motion.div>
                ) : (
                  <PrimaryButton
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="w-full py-4 rounded-2xl text-base font-semibold shadow-lg shadow-indigo-500/20 disabled:bg-indigo-500/50"
                  >
                    {isGeneratingVideo ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2Icon className="size-4 animate-spin" />
                        Generating Video...
                      </span>
                    ) : "Generate Video"}
                  </PrimaryButton>
                )}
              </div>

              {/* Decorative Icon Background */}
              <Video className={`absolute bottom-[-20%] right-[-5%] size-40 transition-all duration-700 -rotate-12 group-hover:scale-110 ${videoGenerated ? 'text-emerald-500/10' : 'text-white/[0.03]'}`} />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

