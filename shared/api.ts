/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Alarm-related types
 */
export interface Alarm {
  id: string;
  time: string; // HH:MM format
  label: string;
  enabled: boolean;
  youtubeUrl?: string;
  songTitle?: string;
  conversionStatus?: "converting" | "ready" | "error";
  repeatDays?: string[]; // ['monday', 'tuesday', etc.]
  volume?: number; // 0-100
  fadeIn?: boolean;
  vibration?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface AlarmState {
  alarms: Alarm[];
  isAddingAlarm: boolean;
  selectedAlarm: Partial<Alarm> | null;
  searchResults: YouTubeSearchResult[];
  youtubeQuery: string;
  isSearching: boolean;
}
