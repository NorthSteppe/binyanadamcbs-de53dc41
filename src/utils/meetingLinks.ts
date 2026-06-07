// Generates instant join links for virtual meetings without requiring API integrations.
// Admins can set personal/static room URLs via localStorage (or future site_content keys);
// otherwise we fall back to each provider's instant-meeting URL pattern.

export type MeetingPlatform = "in_person" | "zoom" | "teams" | "google_meet";

const STORAGE_KEYS: Record<Exclude<MeetingPlatform, "in_person">, string> = {
  zoom: "practice_zoom_room_url",
  teams: "practice_teams_room_url",
  google_meet: "practice_meet_room_url",
};

export const getStoredRoomUrl = (platform: Exclude<MeetingPlatform, "in_person">): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS[platform]) || "";
  } catch {
    return "";
  }
};

export const setStoredRoomUrl = (platform: Exclude<MeetingPlatform, "in_person">, url: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS[platform], url.trim());
  } catch {
    /* noop */
  }
};

/**
 * Generates an instant-join link for the given platform.
 * Uses the admin-configured personal room URL if available, otherwise
 * falls back to each provider's public instant-meeting URL.
 */
export const generateMeetingLink = (platform: MeetingPlatform): string => {
  if (platform === "in_person") return "";

  const stored = getStoredRoomUrl(platform);
  if (stored) return stored;

  switch (platform) {
    case "zoom":
      // Zoom's instant meeting launcher (opens client / web app).
      return "https://zoom.us/start/videomeeting";
    case "teams":
      // Teams "meet now" launcher.
      return "https://teams.microsoft.com/l/meeting/new?subject=Blueprint%20Adam%20Session";
    case "google_meet":
      // meet.new instantly creates a fresh Google Meet room.
      return "https://meet.new";
    default:
      return "";
  }
};

export const PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  in_person: "In-person",
  zoom: "Zoom",
  teams: "Microsoft Teams",
  google_meet: "Google Meet",
};
