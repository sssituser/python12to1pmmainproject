import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
  const { courseTitle, topicName } = useParams();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(true);

  // Predefined YouTube video IDs for each topic
  const topicVideos = {
    // Python Topics
    'Python Basics': 'kqtD5dpn9C8', // Your provided video
    'Variables and Data Types': 'cQT33yu9pY8', // Your provided video
    'Loops': '94UHCEmprCY', // Your provided video
    'Functions': 'u-OmVr_fT4s', // Your provided video
    'Lists and Tuples': '1uCH3zqbv2s', // Your provided video
    'Dictionaries': '2IsF7DEtVjg', // Your provided video
    'File Handling': 'aequTxAvQq4', // Your provided video
    'Exception Handling': '6SPDvPK38tw', // Your provided video
    
    // JavaScript Topics
    'JS Basics': 'TioxU0wdMQg', // Your provided video
    'ES6': 'NCwa_xi0Uuc', // Your provided video
    'DOM Manipulation': '5fb2aPlgoys', // Your provided video
    'React Basics': 'm55PTVUrlnA', // Your provided video
    'Arrays and Objects': 'S1dWe3f2zm0', // Your provided video
    'Async Programming': 'wKY4-WMmbZw', // Your provided video
    'Event Handling': '_i-uLJAh79U', // Your provided video
    'Error Handling': '79RjHaAYT-4', // Your provided video
    
    // Java Topics
    'Introduction to Java': 'r59xYe3Vyks', // Your provided video
    'Java Operators': 'RbjB3SIaabM', // Your provided video
    'Data Types': 'Le25I331_yU', // Your provided video
    'Control Flow': 'fGeE6JFqNU8', // Your provided video
    'Methods': 'KSS3MUbBWLk', // Your provided video
    'Classes and Objects': 'Znmz_WxMxp4', // Your provided video
    'Inheritance': 'dFuVh_Bzy9c', // Your provided video
    'Polymorphism': '6U-0aUBiO5A', // Your provided video
    
    // SQL Topics
    'SQL Basics': 'h0nxCDiD-zg', // Your provided video
    'SELECT Queries': '1cWUUELO42c', // Your provided video
    'Joins': 'xkYpNfpmbGY', // Your provided video
    'Aggregate Functions': 'RGIVS8RGBaI', // Your provided video
    'Subqueries': 'nJIEIzF7tDw', // Your provided video
    'Indexes': 'NZgfYbAmge8', // Your provided video
    'Transactions': '7S_tz1z_5bA', // Your provided video
    'Database Normalization': 'rBPQ5fg_kiY', // Your provided video
    
    // .NET Topics
    '.NET Introduction': 'h7huHkvPoEE', // Your provided video
    'C# Basics': '0u9k-kOR3KE', // Your provided video
    'ASP.NET Core': '6YIRKBsRWVI', // Your provided video
    'MVC Pattern': 'lpA8dpYB18M', // Your provided video
    'Entity Framework': '6YIRKBsRWVI', // Your provided video
    'Dependency Injection': 'tTJetZj3vg0', // Your provided video
    'Authentication': 'V-S5JZJUvvU', // Your provided video
    'Web API Development': 'xTSildbadAs', // Your provided video
    
    // React Topics
    'React Basics': 's2skans2dP4', // Your provided video
    'Components': 'Rh3tobg7hEo', // Your provided video
    'State Management': '_hgpcwmYH4g', // Your provided video
    'Hooks': 'HnXPKtro4SM', // Your provided video
    'Props and PropTypes': 'AqlTYPyA6vE', // Your provided video
    'Conditional Rendering': 'VwuwodgrIaU', // Your provided video
    'Forms in React': 'pFHsaFFcfAY', // Your provided video
    'React Router': 'oTIJunBa6MA', // Your provided video
    
    // DevOps Topics
    'Introduction': '6GQRb4fGvtk', // Your provided video
    'Basic Concepts': 'Ou9j73aWgyE', // Your provided video
    'Advanced Features': 'RRBF2YWXFtY', // Your provided video
    'Best Practices': 'Fhroavsqw6U', // Your provided video
    'Real-world Applications': 'hQcFE0RD0cQ', // Your provided video
    'Troubleshooting': 'DGjbi2alZK4', // Your provided video
    'Performance Optimization': 'G_nVMUtaqCk', // Your provided video
    'Future Trends': 'IiuWlqabx9M', // Your provided video
  };

  useEffect(() => {
    // Get the specific video ID for the topic
    const videoIdForTopic = topicVideos[topicName] || 'kqtD5dpn9C8'; // Updated default to your Python basics video
    setVideoId(videoIdForTopic);
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
          onClick={() => navigate('/dashboard/course')}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ← Back to Courses
        </button>
      </div>

      {/* Video Player */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
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
