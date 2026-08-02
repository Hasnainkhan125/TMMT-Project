import React from "react";
import SEO from "@/components/SEO/SEO";

const AboutPage = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tammat Visa Services",
    url: "https://tammat.ae",
    logo: "https://tammat.ae/tmmetLogo.png",
    description:
      "Tammat provides professional UAE visa services for tourists, residents, and investors. Fast processing, expert support, and comprehensive visa solutions in Dubai and across the UAE.",
    sameAs: [
      // Add your social media links here when available
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "AE",
        availableLanguage: ["English", "Arabic"],
      },
    ],
    areaServed: [
      { "@type": "Place", name: "Dubai" },
      { "@type": "Place", name: "Abu Dhabi" },
      { "@type": "Place", name: "Sharjah" },
      { "@type": "Place", name: "United Arab Emirates" },
    ],
  };

  return (
    <>
      <SEO
        title="About Tammat - Professional UAE Visa Services"
        description="Learn about Tammat's professional visa services in Dubai and UAE. Expert team, fast processing, and comprehensive support for all your visa needs."
        keywords="about Tammat, UAE visa services, Dubai visa company, professional visa services, visa experts UAE"
        canonicalUrl="/about"
        structuredData={schemaData}
      />

      {/* Hero Section */}
      <section className="relative bg-black text-white py-20 px-6 md:px-12 lg:px-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          About Skitbit International
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-80">
          Pioneering the future of 3D product animation for global brands.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-neutral-900 text-white px-6 md:px-12 lg:px-20">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              title: "3D Product Animation",
              desc: "Photo-realistic animations that showcase your products in stunning detail.",
            },
            {
              title: "Global Reach",
              desc: "Serving Miami, LA, New York, Canada, and the UK with world-class visuals.",
            },
            {
              title: "Cutting-edge Technology",
              desc: "Using the latest rendering engines and motion design tools.",
            },
            {
              title: "Brand Storytelling",
              desc: "Helping brands communicate their vision through immersive 3D visuals.",
            },
            {
              title: "Collaborative Workflow",
              desc: "Work directly with our creative team for maximum efficiency.",
            },
            {
              title: "SEO & Marketing Focus",
              desc: "Optimized content to enhance your visibility on search engines.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-800 p-6 rounded-2xl shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-center text-white px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Elevate Your Brand?
        </h2>
        <p className="text-lg opacity-80 mb-8">
          Let Skitbit International bring your products to life.
        </p>
        <a
          href="/contact"
          className="bg-background text-black px-6 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-all"
        >
          Get in Touch
        </a>
      </section>
    </>
  );
}
export default AboutPage;
