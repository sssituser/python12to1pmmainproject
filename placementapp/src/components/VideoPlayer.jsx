import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaExpand, FaCompress, FaCog, FaClosedCaption, FaStepForward, FaStepBackward } from 'react-icons/fa';

const VideoPlayer = ({ 
  videoUrl, 
  title, 
  poster, 
  autoplay = false, 
  controls = true, 
  loop = false, 
  muted = false, 
  className = '',
  onEnded,
  onError,
  onProgress,
  onLoadedMetadata 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [captions, setCaptions] = useState([]);
  const [showCaptions, setShowCaptions] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (delta) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle seeking
  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle quality change
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    setShowSettings(false);
  };

  // Handle playback rate
  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Sample captions data
  useEffect(() => {
    if (title) {
      const sampleCaptions = [
        { start: 0, end: 3, text: "Welcome to this video tutorial on course management" },
        { start: 4, end: 7, text: "In this section, we'll learn how to create dynamic courses" },
        { start: 8, end: 11, text: "First, let's set up the course basic information" },
        { start: 12, end: 15, text: "Adding topics and structuring the course content" }
      ];
      setCaptions(sampleCaptions);
    }
  }, [title]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', () => {
        if (video.duration) {
          setDuration(video.duration);
        }
      });
      video.addEventListener('ended', () => {
        setIsPlaying(false);
        onEnded?.();
      });
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        onError?.(e);
      });
      video.addEventListener('progress', (e) => {
        if (e.lengthComputable && e.length > 0) {
          onProgress?.(e);
        }
      });
      video.addEventListener('loadeddata', () => {
        onLoadedMetadata?.(video);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateTime);
        videoRef.current.removeEventListener('loadedmetadata', () => {
          if (videoRef.current.duration) {
            setDuration(videoRef.current.duration);
          }
        });
        videoRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
          onEnded?.();
        });
        videoRef.current.removeEventListener('ended', () => setIsPlaying(false));
        videoRef.current.removeEventListener('error', onError);
        videoRef.current.removeEventListener('progress', onProgress);
        videoRef.current.removeEventListener('loadeddata', onLoadedMetadata);
      }
    };
  }, [videoUrl, onEnded, onError, onProgress, onLoadedMetadata]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${theaterMode ? 'max-w-6xl mx-auto' : 'w-full'} ${className}`}
    >
      {/* Loading State */}
      {!videoUrl ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading video...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            playsInline
            className="w-full h-full"
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls Overlay */}
          {controls && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/70 opacity-0 hover:opacity-100 transition-opacity duration-300">
              
              {/* Top Controls Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                
                {/* Progress Bar */}
                <div className="flex items-center flex-1 mx-4">
                  <span className="text-white text-xs mr-2">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 bg-white/20 rounded-full h-1 relative">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-100"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-xs ml-2">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleVolumeChange(-0.1)}
                    className="text-white hover:text-gray-300 transition-colors p-2"
                    title="Decrease volume"
                  >
                    <FaVolumeDown />
                  </button>
                  <button 
                    onClick={() => handleVolumeChange(0.1)}
                    className="text-white hover:text-gray-300 transition-colors p-2"
                    title="Increase volume"
                  >
                    <FaVolumeUp />
                  </button>
                  <div className="w-20">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value);
                        setVolume(newVolume);
                        if (videoRef.current) {
                          videoRef.current.volume = newVolume;
                        }
                      }}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  {/* Playback Speed */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:text-gray-300 transition-colors p-2"
                      title="Settings"
                    >
                      <FaCog />
                    </button>
                    
                    {/* Settings Dropdown */}
                    {showSettings && (
                      <div className="absolute bottom-full right-0 bg-gray-900 rounded-lg shadow-xl p-2 min-w-48 z-50">
                        <div className="text-white text-sm">
                          <div className="font-semibold mb-2">Playback Speed</div>
                          <div className="space-y-1">
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                              <button
                                key={rate}
                                onClick={() => handlePlaybackRate(rate)}
                                className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
                                  playbackRate === rate ? 'bg-gray-700' : 'hover:bg-gray-600'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                          
                          <div className="font-semibold mb-2 mt-3">Quality</div>
                          <div className="space-y-1">
                            {['auto', '1080p', '720p', '480p'].map(q => (
                              <button
                                key={q}
                                onClick={() => handleQualityChange(q)}
                                className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
                                  quality === q ? 'bg-gray-700' : 'hover:bg-gray-600'
                                }`}
                              >
                                {q === 'auto' ? 'Auto' : q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theater Mode */}
                  <button 
                    onClick={() => setTheaterMode(!theaterMode)}
                    className={`text-white hover:text-gray-300 transition-colors p-2 ${
                      theaterMode ? 'bg-gray-700' : ''
                    }`}
                    title="Theater mode"
                  >
                    {theaterMode ? <FaCompress /> : <FaExpand />}
                  </button>

                  {/* Captions */}
                  <button 
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`text-white hover:text-gray-300 transition-colors p-2 ${
                      showCaptions ? 'bg-gray-700' : ''
                    }`}
                    title="Captions"
                  >
                    <FaClosedCaption />
                  </button>

                  {/* Picture in Picture */}
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:text-gray-300 transition-colors p-2"
                    title="Fullscreen"
                  >
                    <FaExpand />
                  </button>
                </div>
              </div>

              {/* Center Play/Pause Button */}
              <button 
                onClick={togglePlayPause}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all duration-300 group"
              >
                {isPlaying ? (
                  <FaPause className="text-white text-2xl" />
                ) : (
                  <FaPlay className="text-white text-2xl ml-1" />
                )}
              </button>
            </div>

            {/* Video Title */}
            {title && (
              <div className="absolute top-4 left-4 right-4 text-white">
                <h3 className="text-lg font-semibold bg-black/50 px-3 py-2 rounded">
                  {title}
                </h3>
              </div>
            )}

            {/* Side Controls */}
            <div className="absolute right-4 top-1/2 flex flex-col gap-2">
              {/* Skip Backward */}
              <button 
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="text-white hover:text-gray-300 transition-colors p-2"
                title="Skip backward 10s"
              >
                <FaStepBackward />
              </button>

              {/* Skip Forward */}
              <button 
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                className="text-white hover:text-gray-300 transition-colors p-2"
                title="Skip forward 10s"
              >
                <FaStepForward />
              </button>
            </div>
          </div>

          {/* Captions Overlay */}
          {showCaptions && captions.length > 0 && (
            <div className="absolute bottom-20 left-1/2 right-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg max-w-md">
                {captions.map((caption, index) => (
                  currentTime >= caption.start && currentTime <= caption.end && (
                    <div key={index} className="text-sm">
                      {caption.text}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
