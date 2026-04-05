import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
  const { courseTitle, topicName } = useParams();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState('');
  const [customVideoSrc, setCustomVideoSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUsingDefaultVideo, setIsUsingDefaultVideo] = useState(false);

  // Persistence and Tracking Refs
  const ytPlayerRef = useRef(null);
  const nativeVideoRef = useRef(null);

  // Sync current time periodically to localStorage
  useEffect(() => {
    if (!videoId && !customVideoSrc) return;

    const interval = setInterval(() => {
      let currentTime = 0;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        currentTime = Math.floor(ytPlayerRef.current.getCurrentTime());
      } else if (nativeVideoRef.current) {
        currentTime = Math.floor(nativeVideoRef.current.currentTime);
      }

      if (currentTime > 2) { // Only save if we've actually started
        localStorage.setItem(`time_${courseTitle}_${topicName}`, currentTime.toString());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [videoId, customVideoSrc, courseTitle, topicName]);

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current) {
            try { ytPlayerRef.current.destroy(); } catch(e) {}
        }

        const savedTime = parseInt(localStorage.getItem(`time_${courseTitle}_${topicName}`)) || 0;
        
        ytPlayerRef.current = new window.YT.Player('yt-iframe', {
          events: {
            'onReady': (event) => {
              if (savedTime > 0) {
                  event.target.seekTo(savedTime, true);
              }
            }
          }
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYT;
    } else {
      initYT();
    }
  }, [videoId]);

  // Native Video Resume logic
  useEffect(() => {
    if (nativeVideoRef.current && (customVideoSrc?.isNativeVideo)) {
        const savedTime = parseInt(localStorage.getItem(`time_${courseTitle}_${topicName}`)) || 0;
        if (savedTime > 0) {
            nativeVideoRef.current.currentTime = savedTime;
        }
    }
  }, [customVideoSrc, videoId]);

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
    
    // Python Topics
    'Python Basics': '_uQrJ0TkZlc',  
    'Variables and Data Types': 'LKFrQXaoSMQ',
    'Loops': 'KWgYha0clzw',
    'Functions': '89cGQjB5R4M',
    'Lists and Tuples': 'gOMW_n2-2Mw',
    'Dictionaries': 'MZZSMaEAC2g',
    'File Handling': 'aequTxAvQq4',
    'Exception Handling': 'V_NXT2-QIlE',
    
    // JavaScript Topics
    'JS Basics': 'TioxU0wdMQg',
    'ES6': 'NCwa_xi0Uuc',
    'DOM Manipulation': 'y17RuWkWdn8',
    'React Basics': 'SqcY0GlETPk',
    'Arrays and Objects': 'yQ1fz8LY354',
    'Async Programming': '670f71LTWpM',
    'Event Handling': 'YiOlaiscqDY',
    'Error Handling': 'NwoAZF66_Go',

    // Java Topics
    'Introduction to Java': 'bm0OyhwFDuY',
    'Java Operators': 'xKu0JL9L12I',
    'Data Types': 'Le25I331_yU',
    'Control Flow': 'qX6oNPX3gmE',
    'Methods': 'E-jRVfgT2es',
    'Classes and Objects': 'Znmz_WxMxp4',
    'Inheritance': 'dFuVh_Bzy9c',
    'Polymorphism': '6U-0aUBiO5A',

    // SQL Topics
    'SQL Basics': '3s0lFtUrhSQ',
    'SELECT Queries': '1cWUUELO42c',
    'Joins': '0OQJDd3QqQM',
    'Aggregate Functions': 'RGIVS8RGBaI',
    'Subqueries': 'nJIEIzF7tDw',
    'Indexes': 'BIlFTFrEFOI',
    'Transactions': '20SXjcg6EIw',
    'Database Normalization': 'rBPQ5fg_kiY',

    // .NET Topics
    '.NET Introduction': '6BcPIvVfVAw',
    'C# Basics': '0u9k-kOR3KE',
    'ASP.NET Core': '4IgC2Q5-yDE',
    'MVC Pattern': 'DUg2SWWK18I',
    'Entity Framework': 'Z7713GBhi4k',
    'Dependency Injection': 'BPGtVpu81ek',
    'Authentication': 'V-S5JZJUvvU',
    'Web API Development': '6YIRKBsRWVI',
  };

  useEffect(() => {
    const fetchVideo = async () => {
      // 0. Intercept and safely mount custom configured Faculty video if present natively
      const storedVideoConf = localStorage.getItem('currentCustomVideo');
      if (storedVideoConf) {
        try {
          const parsedV = JSON.parse(storedVideoConf);
          if (parsedV && parsedV.url) {
            if (parsedV.type === 'link') {
              const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
              const match = parsedV.url.match(ytRegex);
              if (match && match[1]) {
                setVideoId(match[1]); // Leverage standardized embed layout
              } else {
                setCustomVideoSrc({ url: parsedV.url, isNativeVideo: false }); // Generic iframe bridge
              }
            } else if (parsedV.type === 'upload') {
              setCustomVideoSrc({ url: parsedV.url, isNativeVideo: true }); // Raw HTML5 rendering
            }
            setLoading(false);
            return;
          }
        } catch(e) { console.error('Failed processing isolated custom video parameters.'); }
      }

      // 1. Check if the topic has a predefined mapped video
      if (topicVideos[topicName]) {
        setVideoId(topicVideos[topicName]);
        setIsUsingDefaultVideo(false);
        setLoading(false);
        return;
      }
      
      // 2. Fetch dynamically using local Vite proxy API to bypass CORS
      try {
        setLoading(true);
        const query = encodeURIComponent(`${courseTitle} ${topicName} tutorial english`);
        const response = await fetch(`/yt-search?search_query=${query}`);
        if (!response.ok) throw new Error("Fetch failed");
        
        const htmlText = await response.text();
        
        // Parse YouTube's structured JSON to safely extract a video >= 3 minutes
        let foundVideoId = null;
        try {
          const jsonMatch = htmlText.match(/var ytInitialData = (\{.*?\});<\/script>/);
          if (jsonMatch && jsonMatch[1]) {
            const ytData = JSON.parse(jsonMatch[1]);
            const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
            
            if (contents) {
              outerLoop: for (let section of contents) {
                if (section?.itemSectionRenderer?.contents) {
                  for (let item of section.itemSectionRenderer.contents) {
                    const video = item.videoRenderer;
                    if (video && video.videoId && video.lengthText?.simpleText) {
                      const timeStr = video.lengthText.simpleText; // e.g., "4:05" or "1:10:00"
                      const parts = timeStr.split(':').map(Number);
                      let seconds = 0;
                      if (parts.length === 3) seconds = parts[0]*3600 + parts[1]*60 + parts[2];
                      else if (parts.length === 2) seconds = parts[0]*60 + parts[1];
                      else if (parts.length === 1) seconds = parts[0];
                      
                      // Condition: Video must be at least 3 minutes (180 seconds)
                      if (seconds >= 180) {
                        foundVideoId = video.videoId;
                        break outerLoop;
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (parseErr) {
          console.error("Failed to parse Youtube JSON structured data for duration", parseErr);
        }
        
        if (foundVideoId) {
          setVideoId(foundVideoId);
          setIsUsingDefaultVideo(false);
        } else {
          // If no video > 3 min found gracefully fallback to any valid regex video
          const fallbackMatch = htmlText.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (fallbackMatch && fallbackMatch[1]) {
            setVideoId(fallbackMatch[1]);
            setIsUsingDefaultVideo(false);
          } else {
            // Absolute fallback if parsing fails completely
            setVideoId('dQw4w9WgXcQ'); 
            setIsUsingDefaultVideo(true);
          }
        }
      } catch (error) {
        console.error("Error searching YouTube dynamically:", error);
        setVideoId('dQw4w9WgXcQ'); // generic fallback
        setIsUsingDefaultVideo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [courseTitle, topicName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col font-sans relative overflow-x-hidden">
      {/* Abstract Colorful Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-400 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Video Player Full Page Layout */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 relative z-10 w-full h-screen">
        
        {/* Wrapper for button & video spanning full dimensions */}
        <div className="w-full h-full flex flex-col max-w-[100%] max-h-screen">
          
          {/* Top Bar for Back Button securely outside the video */}
          <div className="flex justify-end w-full mb-4 mt-2 shrink-0">
            <button
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                const subject = searchParams.get('subject');
                const courseName = courseTitle.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
                
                const returnPath = isFaculty ? `/faculty/Course/${courseName}` : `/dashboard/course/${courseName}`;
                const subjectQuery = subject ? `?subject=${encodeURIComponent(subject)}` : '';
                
                navigate(`${returnPath}${subjectQuery}`);
              }}
              className="group flex items-center gap-2 text-purple-700 bg-white hover:bg-gray-50 font-bold px-6 py-3 rounded-full shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)] hover:-translate-y-0.5 transition-all duration-300 z-50 relative"
            >
              <span className="group-hover:-translate-x-1 transition-transform">🔙</span> Back
            </button>
          </div>

          {/* Embedded Video Player - Never fails via dynamic search fallback! */}
          <div className="relative group w-full flex-grow flex flex-col min-h-0">
            {/* Vibrant Outer Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 rounded-[2.5rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"></div>
            
            {/* Full Page iframe/Video Container */}
            <div className="relative w-full flex-grow overflow-hidden rounded-[2rem] border-[6px] border-white/80 shadow-2xl bg-black z-10 transition-transform duration-300">
              {videoId ? (
                <iframe
                  id="yt-iframe"
                  className="absolute inset-0 w-full h-full rounded-[1.5rem]"
                  src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (customVideoSrc && customVideoSrc.isNativeVideo) ? (
                <video 
                  ref={nativeVideoRef}
                  className="absolute inset-0 w-full h-full rounded-[1.5rem] object-contain bg-black"
                  src={customVideoSrc.url}
                  controls
                  autoPlay
                />
              ) : (customVideoSrc && !customVideoSrc.isNativeVideo) ? (
                <iframe
                  className="absolute inset-0 w-full h-full rounded-[1.5rem] bg-white"
                  src={customVideoSrc.url}
                  title="Custom external video wrapper layer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
