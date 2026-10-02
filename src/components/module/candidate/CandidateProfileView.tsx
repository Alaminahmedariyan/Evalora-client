import {
  Briefcase,
  FileText,
  Globe,
  MapPin,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CandidateProfile } from "@/types";

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.13c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.3ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.57V8.99H3.56v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

export function CandidateProfileView({
  profile,
}: {
  profile: CandidateProfile;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage
            src={profile.user.image ?? undefined}
            alt={profile.user.name}
          />
          <AvatarFallback className="text-lg">
            {initialsFromName(profile.user.name)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-xl font-semibold">{profile.user.name}</h1>

          {profile.headline ? (
            <p className="text-sm text-muted-foreground">
              {profile.headline}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {profile.user.email}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {profile.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {profile.location}
          </span>
        ) : null}

        {profile.experienceYears !== null ? (
          <span className="flex items-center gap-1.5">
            <Briefcase className="size-4" aria-hidden="true" />
            {profile.experienceYears} year
            {profile.experienceYears === 1 ? "" : "s"} experience
          </span>
        ) : null}

        {profile.phone ? <span>{profile.phone}</span> : null}
      </div>

      {profile.bio ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {profile.bio}
        </p>
      ) : null}

      {profile.skills && profile.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {profile.resumeUrl ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Resume
            </a>
          </Button>
        ) : null}

        {profile.linkedinUrl ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedinIcon />
              LinkedIn
            </a>
          </Button>
        ) : null}

        {profile.githubUrl ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
              GitHub
            </a>
          </Button>
        ) : null}

        {profile.portfolioUrl ? (
          <Button asChild variant="outline" size="sm">
            <a
              href={profile.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              Portfolio
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}