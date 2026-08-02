"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import intuitive1 from "./images/intuitive-1.png"
import intuitive2 from "./images/intuitive-2.png"
import topRated1 from "./images/top-rated-1.png"
import topRated2 from "./images/top-rated-2.png"
interface FeaturesContent {
  title: string
  subtitle: string
}

const defaultContent: FeaturesContent = {
  title: "What makes us the best for you.",
  subtitle: "Discover our unique approach to VISA & Residency",
}

const Features=()=> {
  const [content, setContent] = useState<FeaturesContent>(defaultContent)

  useEffect(() => {
    // Load content from localStorage
    const savedContent = localStorage.getItem("-content")
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent)
        if (parsed.features) {
          setContent(parsed.features)
        }
      } catch (error) {
        console.error("Error parsing saved content:", error)
      }
    }
  }, [])

  return (
    <section id="features" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="mb-8 text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {content.title}
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adaptability Card - Hidden on mobile */}
        <Card className="hidden md:block liquid-glass border border-white/10 bg-background/5 backdrop-blur-xl">
          <CardHeader>
            <p className="text-[11px] tracking-widest text-neutral-400">ADAPTABILITY</p>
            <CardTitle className="mt-1 text-xl text-white">Make the experience truly intuitive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                <img
                  src={intuitive1}
                  alt="Close-up smartphone camera module on textured leather back"
                  className="object-cover h-full w-full"
                  sizes="(min-width: 768px) 240px, 45vw"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                <img
                  src={intuitive2}
                  alt="Hand gripping textured phone back — macro detail"
                  className="object-cover h-full w-full"
                  sizes="(min-width: 768px) 240px, 45vw"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Love Card - Always visible */}
        <Card className="liquid-glass border border-white/10 bg-background/5 backdrop-blur-xl">
          <CardHeader>
            <p className="text-[11px] tracking-widest text-neutral-400">CLIENT LOVE</p>
            <CardTitle className="mt-1 text-xl text-white">
              Their work didn't just look good, it moved the needle — our audience felt the difference instantly.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-end gap-4">
              <div className="text-5xl font-bold text-lime-300">4.9</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-lime-300 text-lime-300" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={topRated1}
                width={280}
                height={160}
                alt="Product sketch concepts of backpack on paper"
                className="h-full w-full rounded-xl border border-white/10 object-cover"
              />
              <img
                src={topRated2}
                width={280}
                height={160}
                alt="Backpacks on stage with Smartpack PRO lighting"
                className="h-full w-full rounded-xl border border-white/10 object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
export default Features