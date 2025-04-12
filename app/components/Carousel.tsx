import React from "react";
import { brands } from "~/constants";

const BrandCarousel = () => {
	return (
		<div className="fixed w-full h-[50px] overflow-hidden bg-gray-100 bottom-3 left-3 ">
			<div className="absolute flex items-center h-full animate-scroll whitespace-nowrap">
				{/* First set of images */}
				{brands.map((imageUrl, index) => (
					<div key={index} className="inline-flex items-center h-full px-4">
						<img
							src={imageUrl}
							alt={`Brand logo ${index}`}
							className="h-[40px] max-w-[100px] object-contain filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
						/>
					</div>
				))}

				{/* Duplicate for seamless looping */}
				{brands.map((imageUrl, index) => (
					<div key={`dup-${index}`} className="inline-flex items-center h-full px-4">
						<img
							src={imageUrl}
							alt={`Brand logo ${index}`}
							className="h-[40px] max-w-[100px] object-contain filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default BrandCarousel;
