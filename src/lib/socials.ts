import { SOCIAL_LINKS } from "@/lib/content"
import {
  EnvelopeIcon,
  GithubIcon,
  LinkedinIcon,
  ResumeIcon,
  StackOverflowIcon,
} from "@/lib/icons"

export type Social = {
  href: string
  icon: typeof GithubIcon
  label: string
}

export const SOCIALS: Social[] = [
  { href: SOCIAL_LINKS.github, icon: GithubIcon, label: "GitHub" },
  { href: SOCIAL_LINKS.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  { href: SOCIAL_LINKS.stackoverflow, icon: StackOverflowIcon, label: "Stack Overflow" },
  { href: SOCIAL_LINKS.email, icon: EnvelopeIcon, label: "Email" },
  { href: SOCIAL_LINKS.resume, icon: ResumeIcon, label: "Resume" },
]

export const isExternal = (href: string) => href.startsWith("http")
