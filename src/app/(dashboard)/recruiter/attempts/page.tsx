import { redirect } from "next/navigation";

// There is no list of all attempts. Attempts are reviewed per assessment,
// from its leaderboard; a single attempt lives at /recruiter/attempts/[id].
export default function RecruiterAttemptsPage() {
  redirect("/recruiter/assessments");
}