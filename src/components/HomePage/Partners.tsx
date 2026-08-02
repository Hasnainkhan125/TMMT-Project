import { motion } from "framer-motion";


import React from "react";



const Partners = () => {
	return (
		<section id="partners" className="py-20 rounded-tl-[9rem] rounded-tr-[9rem] -m-[3rem] bg-black   px-4 relative overflow-hidden">
			<div className="max-w-7xl mx-auto w-full h-screen">

		<h1 className="text-4xl font-poppins font-bold mb-4 text-white">Partners</h1>
		<div className="  w-full gap-4 flex flex-col md:flex-row h-full">
			<div className=" flex justify-center z-10 w-full rounded-5xl h-full relative">
		<iframe 
			className="videoHero h-full rounded-4
            xl w-screen " 
			src="https://videos.ctfassets.net/zoq5l15g49wj/4yyTaNxoBq3A478SQfHBN4/af03b512e25d5178413821153fced399/CFC_x_DAMAC_16x9_1.mp4?&rel=0&showinfo=0&controls=0&loop=1&autoplay=1&playsinline=1&muted=1" 
			title="YouTube video player" 
			frameBorder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;" 
			allowFullScreen
		>
		</iframe>
		<div className="absolute z-10 w-full bg-black  bottom-0 left-0 backdrop-blur-3xl h-[8rem]"></div>

		</div>

		{/* <div className=" flex justify-center z-10 w-full rounded-3xl h-full relative">
			<iframe 
				className="videoHero h-full rounded-3xl w-full " 
				src="https://www.youtube.com/embed/Y6p0og-JxOc?si=5sO3ReGtu-m-VZTE&modestbranding=1&muted=1&rel=0&showinfo=0&controls=0&loop=1&playsinline=1&autoplay=1" 
				title="YouTube video player" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; "
				// style={{ pointerEvents: "none" }}
			></iframe>
			<div className="absolute z-10 w-full bg-black  bottom-0 left-0 backdrop-blur-3xl h-[5rem]"></div>

		</div> */}
			</div>
				</div>
		</section>
	)
}

export default Partners;
