import { useState, useCallback } from 'react';
import { Alarm, AlarmState, YouTubeSearchResult } from '@shared/api';

// Mock YouTube search results for demo
const mockSearchResults: YouTubeSearchResult[] = [
  {
    id: '1',
    title: 'Peaceful Morning Nature Sounds',
    channel: 'Nature Sounds',
    duration: '10:00',
    thumbnail: '/placeholder.svg',
    url: 'https://youtube.com/watch?v=example1'
  },
  {
    id: '2',
    title: 'Gentle Piano Wake Up Music',
    channel: 'Piano Relaxing',
    duration: '5:30',
    thumbnail: '/placeholder.svg',
    url: 'https://youtube.com/watch?v=example2'
  },
  {
    id: '3',
    title: 'Birds Chirping Morning Sounds',
    channel: 'Natural Awakening',
    duration: '8:15',
    thumbnail: '/placeholder.svg',
    url: 'https://youtube.com/watch?v=example3'
  },
  {
    id: '4',
    title: 'Soft Jazz for Morning',
    channel: 'Jazz Collection',
    duration: '6:45',
    thumbnail: '/placeholder.svg',
    url: 'https://youtube.com/watch?v=example4'
  }
];

export function useAlarmState() {
  const [state, setState] = useState<AlarmState>({
    alarms: [
      {
        id: '1',
        time: '07:00',
        label: 'Réveil du matin',
        enabled: true,
        songTitle: 'Peaceful Morning Nature Sounds',
        youtubeUrl: 'https://youtube.com/watch?v=example1',
        conversionStatus: 'ready',
        volume: 50,
        fadeIn: true,
        vibration: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        time: '09:30',
        label: 'Réunion importante',
        enabled: false,
        songTitle: 'Gentle Piano Wake Up Music',
        youtubeUrl: 'https://youtube.com/watch?v=example2',
        conversionStatus: 'ready',
        volume: 70,
        fadeIn: false,
        vibration: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    isAddingAlarm: false,
    selectedAlarm: null,
    searchResults: [],
    youtubeQuery: '',
    isSearching: false
  });

  const addAlarm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAddingAlarm: true,
      selectedAlarm: {
        id: '',
        time: '',
        label: '',
        enabled: true,
        volume: 50,
        fadeIn: true,
        vibration: true
      }
    }));
  }, []);

  const editAlarm = useCallback((alarm: Alarm) => {
    setState(prev => ({
      ...prev,
      isAddingAlarm: true,
      selectedAlarm: { ...alarm }
    }));
  }, []);

  const cancelAlarm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAddingAlarm: false,
      selectedAlarm: null,
      searchResults: [],
      youtubeQuery: ''
    }));
  }, []);

  const saveAlarm = useCallback(() => {
    setState(prev => {
      if (!prev.selectedAlarm) return prev;

      const newAlarm: Alarm = {
        ...prev.selectedAlarm,
        id: prev.selectedAlarm.id || Date.now().toString(),
        time: prev.selectedAlarm.time || '07:00',
        label: prev.selectedAlarm.label || 'Mon réveil',
        enabled: prev.selectedAlarm.enabled ?? true,
        volume: prev.selectedAlarm.volume ?? 50,
        fadeIn: prev.selectedAlarm.fadeIn ?? true,
        vibration: prev.selectedAlarm.vibration ?? true,
        createdAt: prev.selectedAlarm.createdAt || new Date(),
        updatedAt: new Date()
      } as Alarm;

      const existingIndex = prev.alarms.findIndex(a => a.id === newAlarm.id);
      const newAlarms = existingIndex >= 0 
        ? prev.alarms.map(a => a.id === newAlarm.id ? newAlarm : a)
        : [...prev.alarms, newAlarm];

      return {
        ...prev,
        alarms: newAlarms.sort((a, b) => a.time.localeCompare(b.time)),
        isAddingAlarm: false,
        selectedAlarm: null,
        searchResults: [],
        youtubeQuery: ''
      };
    });
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alarms: prev.alarms.filter(a => a.id !== id)
    }));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alarms: prev.alarms.map(a => 
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    }));
  }, []);

  const convertFromUrl = useCallback(() => {
    if (!state.youtubeQuery.trim()) return;

    // Basic YouTube URL validation
    const isValidYouTubeUrl = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/.test(state.youtubeQuery);

    if (!isValidYouTubeUrl) {
      // Show error or handle invalid URL
      return;
    }

    setState(prev => ({ ...prev, isSearching: true }));

    // Extract video title from URL (simulated)
    const extractTitleFromUrl = (url: string) => {
      // In a real implementation, you'd make an API call to get video metadata
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
      return `Vidéo YouTube ${videoId?.substring(0, 8) || 'inconnue'}`;
    };

    const songTitle = extractTitleFromUrl(state.youtubeQuery);

    // Start conversion process
    setState(prev => ({
      ...prev,
      selectedAlarm: prev.selectedAlarm ? {
        ...prev.selectedAlarm,
        youtubeUrl: state.youtubeQuery,
        songTitle,
        conversionStatus: 'converting'
      } : null,
      isSearching: false,
      youtubeQuery: '' // Clear the input after conversion starts
    }));

    // Simulate conversion process
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        selectedAlarm: prev.selectedAlarm ? {
          ...prev.selectedAlarm,
          conversionStatus: 'ready'
        } : null
      }));
    }, 3000); // Longer conversion time to simulate real MP3 conversion
  }, [state.youtubeQuery]);

  const selectSong = useCallback((song: YouTubeSearchResult) => {
    setState(prev => ({
      ...prev,
      selectedAlarm: prev.selectedAlarm ? {
        ...prev.selectedAlarm,
        youtubeUrl: song.url,
        songTitle: song.title,
        conversionStatus: 'converting'
      } : null,
      searchResults: []
    }));

    // Simulate conversion process
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        selectedAlarm: prev.selectedAlarm ? {
          ...prev.selectedAlarm,
          conversionStatus: 'ready'
        } : null
      }));
    }, 2000);
  }, []);

  const updateSelectedAlarm = useCallback((updates: Partial<Alarm>) => {
    setState(prev => ({
      ...prev,
      selectedAlarm: prev.selectedAlarm ? {
        ...prev.selectedAlarm,
        ...updates
      } : null
    }));
  }, []);

  const setYoutubeQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, youtubeQuery: query }));
  }, []);

  return {
    state,
    actions: {
      addAlarm,
      editAlarm,
      cancelAlarm,
      saveAlarm,
      deleteAlarm,
      toggleAlarm,
      convertFromUrl,
      selectSong,
      updateSelectedAlarm,
      setYoutubeQuery
    }
  };
}
