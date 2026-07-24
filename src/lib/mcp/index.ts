import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoAmI from "./tools/who-am-i";
import listUpcomingSessions from "./tools/list-upcoming-sessions";
import listMyTasks from "./tools/list-my-tasks";
import listNotifications from "./tools/list-notifications";

// OAuth issuer MUST be the direct Supabase host, built from the project ref.
// Vite inlines this at build time (import-safe: no runtime env read).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "blueprint-mcp",
  title: "Blueprint",
  version: "0.1.0",
  instructions:
    "Blueprint (Applied Constructional Behavioural Services) tools. Read the signed-in user's profile, upcoming sessions, tasks, and notifications. All access respects the app's role-based permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoAmI, listUpcomingSessions, listMyTasks, listNotifications],
});
