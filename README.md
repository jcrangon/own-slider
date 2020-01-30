# own-slider
 - Slider is fully responsive and will automatically reduce the number of shown slides to accomodate for screen width.
 - Arrows can be hidden. They can be created from an alpha-numeric character or from an image url.
 
 -customizing the slider:
 $(document).ready(function(){
	
	$("#slider1").ownSliders({
		showSlides : 4, // 1 to 4
		slideToScroll : 2, // 1 to 4 must be inf or equal to showSlides value
		delay : 3000, // in milliseconds
		showArrows : true,
		arrowType : "content", // "image" or "content"
		arrowRightContent : ">",
		arrowRightContentSize : 2, // 1 to 5
		slideShadow : false, // default is true
	});
	
	$("#slider2").ownSliders({
		arrowRightImageURL : "https://cpng.pikpng.com/pngl/s/288-2883770_right-arrow-comments-slider-arrow-icon-png-transparent.png",
	});
	
});
