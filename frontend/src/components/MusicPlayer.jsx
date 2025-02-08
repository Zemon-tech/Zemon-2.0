import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axios';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/solid';

export default function MusicPlayer() {
  const [music, setMusic] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const widgetRef = useRef(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  useEffect(() => {
    fetchMusic();
  }, []);

  useEffect(() => {
    if (music.length > 0) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(music[currentIndex].embedCode, 'text/html');
        const iframeElement = doc.querySelector('iframe');
        
        if (iframeElement) {
          const uniqueId = `sc-widget-${Date.now()}`;
          iframeElement.id = uniqueId;
          
          // Keep the iframe visible even when minimized
          const embedContainer = document.querySelector('#music-embed-container');
          if (embedContainer) {
            embedContainer.innerHTML = '';
            embedContainer.appendChild(iframeElement);
            
            const initializeWidget = () => {
              if (window.SC) {
                try {
                  const widget = window.SC.Widget(uniqueId);
                  widgetRef.current = widget;

                  widget.bind(window.SC.Widget.Events.READY, () => {
                    console.log('Widget ready');
                    setIsWidgetReady(true);
                    
                    // Set up all event listeners
                    widget.bind(window.SC.Widget.Events.PLAY, () => {
                      console.log('Play event');
                      setIsPlaying(true);
                    });
                    
                    widget.bind(window.SC.Widget.Events.PAUSE, () => {
                      console.log('Pause event');
                      setIsPlaying(false);
                    });
                    
                    widget.bind(window.SC.Widget.Events.FINISH, () => {
                      console.log('Finish event');
                      handleNext();
                    });

                    widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => {
                      setProgress(data.relativePosition * 100);
                    });

                    // Set initial volume
                    widget.setVolume(isMuted ? 0 : 100);

                    // If it was playing before track change, start playing
                    if (isPlaying) {
                      widget.play();
                    }
                  });
                } catch (error) {
                  console.error('Widget initialization error:', error);
                }
              } else {
                setTimeout(initializeWidget, 100);
              }
            };

            initializeWidget();
          }
        }
      } catch (error) {
        console.error('Error setting up widget:', error);
      }
    }

    // Cleanup function
    return () => {
      if (widgetRef.current && isWidgetReady) {
        try {
          widgetRef.current.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    };
  }, [currentIndex, music]);  // Remove isPlaying and isMuted from dependencies

  const fetchMusic = async () => {
    try {
      const response = await axiosInstance.get('/music');
      setMusic(response.data);
    } catch (error) {
      console.error('Failed to fetch music:', error);
    }
  };

  const handlePlay = () => {
    if (widgetRef.current && isWidgetReady) {
      try {
        if (isPlaying) {
          widgetRef.current.pause();
        } else {
          widgetRef.current.play();
        }
      } catch (error) {
        console.error('Play/Pause error:', error);
      }
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % music.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    
    // Give time for the new iframe to load
    setTimeout(() => {
      if (widgetRef.current) {
        try {
          widgetRef.current.play();
        } catch (error) {
          console.error('Next track error:', error);
        }
      }
    }, 1000);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + music.length) % music.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
    
    // Give time for the new iframe to load
    setTimeout(() => {
      if (widgetRef.current) {
        try {
          widgetRef.current.play();
        } catch (error) {
          console.error('Previous track error:', error);
        }
      }
    }, 1000);
  };

  const handleMute = () => {
    if (widgetRef.current) {
      try {
        widgetRef.current.setVolume(isMuted ? 100 : 0);
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Mute error:', error);
      }
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    // Don't touch the widget state at all
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    // Don't touch the widget state at all
  };

  const handleClose = () => {
    if (widgetRef.current && isWidgetReady) {
      try {
        widgetRef.current.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error('Close error:', error);
      }
    }
    setIsMinimized(true);
  };

  if (!music.length) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-16 h-16' : 'w-80'
      }`}
    >
      <div className={`${isMinimized ? 'hidden' : 'block'}`}>
        <div id="music-embed-container" className="absolute opacity-0 pointer-events-none">
          {/* This container will always exist but be invisible */}
        </div>
      </div>

      {isMinimized ? (
        <button
          onClick={handleMaximize}
          className="w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
          <div className={`absolute bottom-0 left-0 w-full h-1 bg-primary-500 transition-transform duration-300 ${isPlaying ? 'animate-progress' : ''}`}></div>
          <MusicalNoteIcon className={`h-8 w-8 text-primary-600 ${isPlaying ? 'animate-bounce-slow' : ''}`} />
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="p-4">
            {/* Header with both minimize and close buttons */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex-1 mr-4">
                <h3 className="font-medium text-gray-900 truncate">
                  {music[currentIndex].title}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  Added by: {music[currentIndex].addedBy?.name || 'Admin'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMinimize}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
                  title="Minimize (keeps playing)"
                >
                  <MusicalNoteIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
                  title="Close player"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Embed Container with custom styling */}
            <div id="music-embed-container" className="mb-4 rounded-lg overflow-hidden bg-gray-50 h-24">
              <style>
                {`
                  #music-embed-container iframe {
                    height: 96px !important;
                  }
                `}
              </style>
            </div>

            {/* Controls with enhanced styling */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handlePrev}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>

              <button
                onClick={handlePlay}
                className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>

              <button
                onClick={handleMute}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="h-6 w-6" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 