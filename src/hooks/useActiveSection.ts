import { useEffect, useState } from "react"

/** Tracks which section id is currently in view for nav highlighting. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "")
  const idsKey = ids.join("|")

  useEffect(() => {
    const list = idsKey ? idsKey.split("|") : []
    if (list.length === 0) return

    const elements = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let bestId = list[0]
        let bestRatio = -1
        for (const id of list) {
          const ratio = ratios.get(id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestRatio > 0) setActive(bestId)
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [idsKey])

  return active
}
