// // src/components/VideoSection/VideoSection2.jsx

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useTranslation } from 'react-i18next';
// import { X, Play, ArrowRight, Shield, Star, Users, CheckCircle, Sparkles, Clock, Award, Globe, Building, Heart } from 'lucide-react';

// const VideoSection2 = () => {
//   const { t } = useTranslation();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const heroVideo = '/images/laptop/hero.mp4';
//   const [isHovering, setIsHovering] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 640);
//     };
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.play().catch(() => {});
//     }
//   }, []);

//   // Prevent scrolling and fix body when expanded
//   useEffect(() => {
//     if (isExpanded) {
//       document.body.style.overflow = 'hidden';
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//       document.body.style.top = `-${window.scrollY}px`;
//     } else {
//       const scrollY = document.body.style.top;
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//       document.body.style.top = '';
//       if (sectionRef.current) {
//         setTimeout(() => {
//           sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         }, 100);
//       }
//     }

//     return () => {
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//       document.body.style.top = '';
//     };
//   }, [isExpanded]);

//   // Click outside to close - stays in section
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (isExpanded) {
//         const target = e.target as HTMLElement;
//         if (!target.closest('.video-container')) {
//           setIsExpanded(false);
//           if (videoRef.current) {
//             videoRef.current.play().catch(() => {});
//           }
//         }
//       }
//     };

//     const handleEscKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isExpanded) {
//         setIsExpanded(false);
//         if (videoRef.current) {
//           videoRef.current.play().catch(() => {});
//         }
//       }
//     };

//     if (isExpanded) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleEscKey);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleEscKey);
//     };
//   }, [isExpanded]);

//   const handleVideoClick = () => {
//     setIsExpanded(!isExpanded);
//     if (videoRef.current) {
//       videoRef.current.play().catch(() => {});
//     }
//   };

//   return (
//     <section 
//       ref={sectionRef}
//       id="video-section-2"
//       className="relative py-20 sm:py-28 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-white to-gray-50/30 dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-[#0F0F0F] scroll-mt-20"
//     >
//       {/* Modern Gradient Orbs */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-0 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0A3269]/5 via-[#0A3269]/3 to-transparent blur-3xl animate-pulse" />
//         <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#0A3269]/5 via-[#0A3269]/3 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-[#0A3269]/3 to-[#0A3269]/3 blur-3xl" />
//       </div>

//       <div className="container mx-auto px-4 sm:px-6 relative z-10">
//         {/* ─── EXPANDED VIEW ────────────────────────────────────────────── */}
//         {isExpanded && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-2xl"
//             onClick={(e) => {
//               if (e.target === e.currentTarget) {
//                 setIsExpanded(false);
//                 if (videoRef.current) {
//                   videoRef.current.play().catch(() => {});
//                 }
//               }
//             }}
//           >
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//               className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative video-container"
//             >
//               {/* Glass Close Button - Responsive */}
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setIsExpanded(false);
//                   if (videoRef.current) {
//                     videoRef.current.play().catch(() => {});
//                   }
//                 }}
//                 className={`
//                   absolute -top-1 right-4 sm:right-6 z-50 
//                   group flex items-center gap-2.5 
//                   bg-black/60 backdrop-blur-2xl 
//                   border border-white/20 
//                   hover:bg-black/80 
//                   transition-all duration-300 shadow-2xl
//                   ${isMobile 
//                     ? 'px-3 py-2 rounded-full text-xs' 
//                     : 'px-5 py-3 rounded-full text-sm'
//                   }
//                 `}
//               >
//                 <span className={`
//                   font-medium text-white/90
//                   ${isMobile ? 'text-[10px]' : 'text-sm'}
//                 `}>
//                   Close
//                 </span>
//                 <X className={`
//                   text-white/90 group-hover:rotate-90 transition-transform duration-300
//                   ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}
//                 `} strokeWidth={1.5} />
//               </button>

//               {/* Video Player - Full Width with Glass Effect */}
//               <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-sm bg-black/30">
//                 <div className="relative aspect-video bg-black">
//                   <video
//                     ref={videoRef}
//                     className="w-full h-full object-cover"
//                     src={heroVideo}
//                     autoPlay
//                     loop
//                     muted
//                     playsInline
//                     preload="auto"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

//                   {/* Click to close hint - Only on desktop */}
//                   {!isMobile && (
//                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-wider bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5">
//                       Click outside or press ESC to close
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}

//         {/* ─── NORMAL VIEW (Two Column Layout) ────────────────────────── */}
//         {!isExpanded && (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
              
//               {/* ─── LEFT COLUMN: Content ─────────────────────────────────── */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, margin: "-100px" }}
//                 transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//                 className="space-y-8"
//               >
//                 <div className="space-y-6">
//                   {/* Premium Badge */}
//                   <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0A3269]/10 to-[#0A3269]/5 dark:from-[#0A3269]/20 dark:to-[#0A3269]/10 border border-[#0A3269]/20 dark:border-[#0A3269]/30 shadow-sm">
//                     <span className="relative flex h-2.5 w-2.5">
//                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0A3269] dark:bg-white opacity-75" />
//                       <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0A3269] dark:bg-white" />
//                     </span>
//                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A3269] dark:text-white">
//                       Why Choose TMMT
//                     </span>
//                   </div>

//                   {/* Big Modern Heading */}
//                   <h2 className="font-poppins text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-black dark:text-white leading-[1.05] tracking-tight">
//                     Your Trusted Partner
//                     <br />
//                     <span className="relative inline-block">
//                       <span className="bg-gradient-to-r from-[#0A3269] via-[#0A3269]/80 to-[#0A3269] bg-clip-text text-transparent">
//                         for UAE Success
//                       </span>
//                       <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#0A3269] to-[#0A3269]/30 rounded-full opacity-60" />
//                     </span>
//                   </h2>

//                   {/* Big Description */}
//                   <p className="text-lg sm:text-xl md:text-2xl text-black/60 dark:text-white/50 leading-relaxed max-w-lg font-light">
//                     We simplify government procedures for individuals and businesses across the UAE.
//                     <span className="text-black dark:text-white/70 font-medium block mt-1"> Expert guidance, faster approvals, and complete peace of mind.</span>
//                   </p>
//                 </div>

//                 {/* Big Stats Grid - Responsive One Row */}
//                 <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-4">
//                   <div className="group relative p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/40 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md">
//                     <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#0A3269] to-[#0A3269]/60 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-white dark:to-white/60 dark:bg-clip-text dark:text-transparent group-hover:scale-105 transition-transform">12+</p>
//                     <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-black/40 dark:text-white/40 mt-0.5 sm:mt-1">Years Experience</p>
//                     <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#0A3269]/0 via-[#0A3269]/40 to-[#0A3269]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
//                   </div>

//                   <div className="group relative p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/40 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md">
//                     <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white group-hover:text-[#0A3269] dark:group-hover:text-[#0A3269] transition-colors">100%</p>
//                     <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-black/40 dark:text-white/40 mt-0.5 sm:mt-1">Client Satisfaction</p>
//                     <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#0A3269]/0 via-[#0A3269]/40 to-[#0A3269]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
//                   </div>

//                   <div className="group relative p-3 sm:p-4 md:p-5 rounded-2xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/40 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md">
//                     <div className="flex items-center gap-0.5 sm:gap-1">
//                       <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white group-hover:text-[#0A3269] dark:group-hover:text-[#0A3269] transition-colors">4.9</p>
//                       <div className="flex">
//                         {[1, 2, 3, 4, 5].map((i) => (
//                           <Star key={i} className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-3 text-yellow-400 fill-yellow-400" />
//                         ))}
//                       </div>
//                     </div>
//                     <p className="text-[8px] sm:text-[10px] md:text-xs font-medium uppercase tracking-wider text-black/40 dark:text-white/40 mt-0.5 sm:mt-1">Rating</p>
//                     <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#0A3269]/0 via-[#0A3269]/40 to-[#0A3269]/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
//                   </div>
//                 </div>

//                 {/* Modern CTA Button */}
//                 <motion.button
//                   whileHover={{ scale: 1.03, y: -2 }}
//                   whileTap={{ scale: 0.97 }}
//                   className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] font-semibold text-base overflow-hidden transition-all duration-300 shadow-xl shadow-[#0A3269]/25 dark:shadow-white/20 hover:shadow-2xl hover:shadow-[#0A3269]/40 dark:hover:shadow-white/30"
//                 >
//                   {/* Shimmer Effect */}
//                   <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
//                   <span className="relative z-10 flex items-center gap-2.5">
//                     <span>Get Started Today</span>
//                     <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-rotate-12" strokeWidth={2.5} />
//                   </span>
//                 </motion.button>

//                 {/* Trust Badge */}
//                 <div className="flex items-center gap-4 pt-2">
//                   <div className="flex -space-x-2">
//                     {[1, 2, 3, 4].map((i) => (
//                       <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0A0A0A] overflow-hidden shadow-sm">
//                         <img
//                           src={`https://i.pravatar.cc/40?img=${i + 10}`}
//                           alt=""
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                   <div>
//                     <p className="text-base font-semibold text-black dark:text-white">Trusted by professionals</p>
//                     <p className="text-sm text-black/40 dark:text-white/30">Join 10,000+ happy customers</p>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* ─── RIGHT COLUMN: Video ──────────────────────────────────── */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, margin: "-100px" }}
//                 transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//                 className="relative"
//                 onMouseEnter={() => setIsHovering(true)}
//                 onMouseLeave={() => setIsHovering(false)}
//               >
//                 <div 
//                   className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-gray-200/50 dark:ring-white/10 cursor-pointer group"
//                   onClick={handleVideoClick}
//                 >
//                   <div className="relative aspect-video bg-black/95">
//                     <video
//                       ref={videoRef}
//                       className="w-full h-full object-cover"
//                       src={heroVideo}
//                       autoPlay
//                       loop
//                       muted
//                       playsInline
//                       preload="auto"
//                     />

//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

//                     {/* Subtle Hover Overlay */}
//                     <AnimatePresence>
//                       {isHovering && !isExpanded && (
//                         <motion.div
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           exit={{ opacity: 0 }}
//                           transition={{ duration: 0.3 }}
//                           className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
//                         >
//                           <motion.div
//                             initial={{ scale: 0.9, y: 10 }}
//                             animate={{ scale: 1, y: 0 }}
//                             exit={{ scale: 0.9, y: 10 }}
//                             transition={{ type: "spring", stiffness: 400, damping: 25 }}
//                             className="flex flex-col items-center gap-2"
//                           >
//                             <span className="text-white/80 text-sm font-medium tracking-wider bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
//                               Click to expand
//                             </span>
//                           </motion.div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>

//                     {/* Glass Progress Bar */}
//                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 backdrop-blur-sm">
//                       <motion.div
//                         className="h-full bg-gradient-to-r from-[#0A3269] via-[#0A3269]/70 to-[#0A3269]/30 rounded-r-full"
//                         initial={{ width: '0%' }}
//                         animate={{ width: '100%' }}
//                         transition={{ duration: 8, ease: "linear", repeat: Infinity }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <p className="text-center text-xs text-gray-400 dark:text-white/20 mt-4 tracking-wider">
//                   Click to expand full screen
//                 </p>
//               </motion.div>
//             </div>

//             {/* ─── BOTTOM TRUST BAR ────────────────────────────────────────── */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.4 }}
//               className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-10 mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-10"
//             >
//               <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10">
//                 <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-black dark:text-white" strokeWidth={2} />
//                 <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white whitespace-nowrap">Secure</span>
//                 <span className="text-[9px] sm:text-[10px] md:text-xs text-black/40 dark:text-white/30 whitespace-nowrap">&amp;</span>
//                 <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white whitespace-nowrap">Trusted</span>
//               </div>

//               <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10">
//                 <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-black dark:text-white" strokeWidth={2} />
//                 <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white whitespace-nowrap">UAE Government Approved</span>
//               </div>

//               <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10">
//                 <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-black dark:text-white" strokeWidth={2} />
//                 <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-black dark:text-white whitespace-nowrap">SOC 2 Compliant</span>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default VideoSection2;