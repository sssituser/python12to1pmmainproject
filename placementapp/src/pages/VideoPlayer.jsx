import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
  const { courseTitle, topicName } = useParams();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUsingDefaultVideo, setIsUsingDefaultVideo] = useState(false);

  // Check if user is faculty
  const user = JSON.parse(localStorage.getItem("user"));
  const isFaculty = user?.role === "faculty";

  // Predefined YouTube video IDs for each topic
  const topicVideos = {
    // React Topics
    'React Intro': 's2skans2dP4', // Your provided video
    'Components': 'Rh3tobg7hEo', // Your provided video
    'State Management': '_hgpcwmYH4g', // Your provided video
    'Hooks': 'HnXPKtro4SM', // Your provided video
    'Props and PropTypes': 'AqlTYPyA6vE', // Your provided video
    'Conditional Rendering': 'VwuwodgrIaU', // Your provided video
    'Forms in React': 'pFHsaFFcfAY', // Your provided video
    'React Router': 'oTIJunBa6MA', // Your provided video
  };

  useEffect(() => {
    // Check if the topic has a specific video mapped
    const hasVideo = topicVideos[topicName];
    
    if (hasVideo) {
      // Play the specific video for this topic
      setVideoId(topicVideos[topicName]);
      setIsUsingDefaultVideo(false);
    } else {
      // No video available for this newly added topic
      setVideoId(null);
      setIsUsingDefaultVideo(true);
    }
    
    setLoading(false);
  }, [topicName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-semibold">
          {courseTitle} - {topicName}
        </h1>
        <button
          onClick={() => {
            // Generate course URL from course title
            const courseName = courseTitle.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            // Navigate to faculty or student course topics based on user role
            if (isFaculty) {
              navigate(`/faculty/Course/${courseName}`);
            } else {
              navigate(`/dashboard/course/${courseName}`);
            }
          }}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ← Back to Topics
        </button>
      </div>

      {/* Video Player */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {videoId ? (
            // Show video player for topics with videos
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                autoPlay
              />
            </div>
          ) : (
            // Show no video available message for newly added topics
            <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-white text-3xl font-bold mb-4">
                No Video Available
              </h2>
              <p className="text-gray-300 text-lg mb-2">
                This is a newly added topic: "{topicName}"
              </p>
              <p className="text-gray-400 mb-6">
                Faculty needs to add a specific video for this topic.
              </p>
              <div className="bg-blue-900 border border-blue-700 rounded p-4">
                <p className="text-blue-300">
                  💡 Faculty can add video mappings in the VideoPlayer component
                </p>
              </div>
            </div>
          )}
          
          {/* Video Info */}
          <div className="mt-4 text-center">
            <h2 className="text-white text-2xl font-bold mb-2">
              {topicName}
            </h2>
            <p className="text-gray-400">
              Learning {topicName} in {courseTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
