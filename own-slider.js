//globals
var osScreenWidth = $(window).width();
var sliderElementList;
var sliderObjList = [];
var isEven=n=>(n%2)?false:true;
var timers = [];
var sliderInstances = [];

function addInstance(instance){
	sliderInstances.push(instance);
}

function createTimer(elementId){
	let timer = new Object;
	addInstance(elementId);
	timers[elementId] = timer;
}

function roundDecimal(nombre, precision){
    var precisiond = precision || 2;
    var tmp = Math.pow(10, precisiond);
    return Math.round( nombre*tmp )/tmp;
}

$( window ).resize(function() {
	if( osScreenWidth != $( window ).width() ){
		 osScreenWidth = $( window ).width();
		 sliderObjList.forEach(function(el){
		 	el.checkScreenWidth();
		 });
	}
});

makeSlider = function(id,options={}){
	var el = document.getElementById(id);
	var a=new OwnSlider(el, options);
	//a.setOptions();
	sliderObjList.push(a);
	return a;
};


class OwnSlider{
	constructor(el, options={}){
		this.el=el;
		this.id=$(el).attr("id");
		createTimer(this.id);
		this.instanceNumber = sliderInstances.length;
		this.instanceIndex = this.instanceNumber-1;
		//console.log(sliderInstances);
		//console.log(timers);
		//console.log(this.instanceNumber);
		this.screenWidth=null;
		this.sliderWidth=null;
		this.slideWidth=null;
		this.slidesNumber=null;
		this.currentShowSlides=null;
		this.currentSlide=null;
		this.slideMove=null;
		this.maxClones=null;
		this.inUse=false;
		this.slideShadow=true; // default: true
		
		this.showSlides=null; //default: 2
		this.slideToScroll=null; //default: 1
		this.delay=null; // default: 4000
		
		this.showArrows=null;
		this.arrowType=null; // default:"image" option: "content"
		this.arrowRightImageURL=null; // default:"https://cpng.pikpng.com/pngl/s/288-2883770_right-arrow-comments-slider-arrow-icon-png-transparent.png"
		this.arrowRightContent=null; // default: ">"
		this.arrowRightContentSize=null; //default: 1
		
		this.setOptions(options);
		this.checkScreenWidth();
		this.prepareSlides();
		this.resizeSlider();
		
		$(this.el).next("div.prev-ownslide").on("click",()=>{this.previousSlide();});
		$(this.el).next("div").next().on("click",()=>{this.nextSlide();});
		$(this.el).on("mouseover",()=>{this.pause();});
		$(this.el).on("mouseout",()=>{this.restart();});
	}
	
	setOptions(options={}){
		let rules;
		let style;
		this.setCurrentSlide(1);
		this.setSlidesNumber($(this.el).find("div.own-slide").length);
		//console.log(this.SlidesNumber);
		//console.log(isEven(this.slidesNumber));
		
		// option: showSlides
		if(options.showSlides && Number.isInteger(options.showSlides)){
			this.setShowSlides(options.showSlides);
		}
		else{
			this.setShowSlides(2);
		}
		if(this.showSlides<1 || this.showSlides>4){
			//alert("Wrong parameter: 'showSlides' must be a number between 1 and 4 included! - System reverted to 1 slide slider...");
			console.log("Wrong parameter: 'showSlides' must be a number between 1 and 4 included! - System reverted to 1 slide slider...");
			this.setShowSlides(1);
		}
		
		//option: slideToScroll
		if(options.slideToScroll && Number.isInteger(options.slideToScroll)){
			this.setSlideToScroll(options.slideToScroll);
		}
		else{
			this.setSlideToScroll(1);
		}
		this.slideToScroll = (null !== this.slideToScroll && (this.slideToScroll > this.showSlides))? this.showSlides : this.slideToScroll;
		
		
		//option: slideShadow
		if(typeof(options.slideShadow) === typeof(true)){
			if(options.slideShadow){
				this.setSlideShadow(true);
				$(this.el).find(".own-slide-content").each(function(){
					if(!$(this).hasClass("shadow")){
						$(this).addClass("shadow");
					}
				});
			}
			else{
				this.setSlideShadow(false);
				$(this.el).find(".own-slide-content").each(function(){
					if($(this).hasClass("shadow")){
						$(this).removeClass("shadow");
					}
				});
			}
		}
		else{
			this.setSlideShadow(true);
			$(this.el).find(".own-slide-content").each(function(){
				if(!$(this).hasClass("shadow")){
					$(this).addClass("shadow");
				}
			});
		}
		//option: delay
		if(options.delay && Number.isInteger(options.delay)){
			this.setDelay(options.delay);
		}
		else{
			this.setDelay(4000);
		}
		
		//option: showArrows
		if(typeof(options.showArrows) === typeof(true)){
			if(options.showArrows){
				this.setShowArrows(true);
			}
			else{
				this.setShowArrows(false);
				$(this.el).next("div.prev-ownslide").css("display","none");
				$(this.el).next("div.prev-ownslide").next().css("display","none");
			}
		}
		else{
			this.setShowArrows(true);
		}
		
		
		// option: arrowRightImageURL
		if(options.arrowRightImageURL){
			this.setArrowRightImageURL(options.arrowRightImageURL);
		}
		else{
			this.setArrowRightImageURL("https://cpng.pikpng.com/pngl/s/288-2883770_right-arrow-comments-slider-arrow-icon-png-transparent.png");
		}
		
		
		//option: arrowRightContent
		if(options.arrowRightContent){
			this.setArrowContent(options.arrowRightContent);
		}
		else{
			this.setArrowContent(">");
		}
		
		//option:arrowRightContentSize
		if(options.arrowRightContentSize){
			if(options.arrowRightContentSize < 1 || options.arrowRightContentSize > 5){
				this.setArrowRightContentSize(1);
			}
			else{
				this.setArrowRightContentSize(options.arrowRightContentSize);
			}
		}
		else{
			this.setArrowRightContentSize(1);	
		}
		
		
		//option: arrowType
		if(options.arrowType){
			if(options.arrowType == "image" || options.arrowType == "content"){
				this.setArrowType(options.arrowType);
			}
			else{
				this.setArrowType("image");
			}
		}
		else{
			this.setArrowType("image");
		}
		
		switch(this.arrowType){
			case "content":
				let centerCorrection;
				
				$(this.el).next("div.prev-ownslide").removeClass("imageType");
				$(this.el).next("div.prev-ownslide").next().removeClass("imageType");
				style = document.createElement('style');
	    		style.type = 'text/css';
	    		
				
				switch(this.arrowRightContentSize){
					case 5:
						centerCorrection = -40;
					break;
					case 4:
						centerCorrection = -35;
					break;
					case 3:
						centerCorrection = -22;
					break;
					case 2:
						centerCorrection = 2;
					break;
					case 1:
						centerCorrection = 15;
					break;
				}
				rules="\ncontent:\"" + this.arrowRightContent + "\";\n";
				rules+="display:inline-block;\n";
				rules+="width:50px;\n";
				rules+="height:59px;\n";
				rules+="position:relative;\n";
				rules+="font-weight:3000;\n";
				rules+="font-size:" + this.arrowRightContentSize + "em;\n";
				if(this.arrowRightContentSize == 1){
					rules+="bottom:-13px;\n";
				}
				
				style.innerHTML += '.prev-ownslide.contentType' + this.instanceNumber + ":before{" + rules + "}\n";
				
				
				rules="\ncontent:\"" + this.arrowRightContent + "\";\n";
				rules+="display:inline-block;\n";
				rules+="width:50px;\n";
				rules+="height:59px;\n";
				rules+="position:relative;\n";
				rules+="font-weight:3000;\n";
				rules+="top:" + centerCorrection + "px;\n";
				rules+="font-size:" + this.arrowRightContentSize + "em;\n";
				
				style.innerHTML += '.next-ownslide.contentType' + this.instanceNumber + ":before{" + rules + "}\n";
				
				document.getElementsByTagName('head')[0].appendChild(style);
				
				$(this.el).next("div.prev-ownslide").addClass("contentType" + this.instanceNumber);
				$(this.el).next("div.prev-ownslide").next().addClass("contentType" + this.instanceNumber);
			break;
			
			default: // arrowType = "image"
				
				style = document.createElement('style');
	    		style.type = 'text/css';
				rules="\ncontent:\"\";\n";
				rules+="display:inline-block;\n";
				rules+="width:50px;\n";
				rules+="height:59px;\n";
				rules+="position:relative;\n";
				rules+="background:url(" + this.arrowRightImageURL + ");\n";
				rules+="background-repeat:no-repeat;\n";
				rules+="background-size:100%;\n";
				rules+="bottom:-13px;\n";
				
				style.innerHTML += '.prev-ownslide.imageType' + this.instanceNumber + ":before{" + rules + "}\n";
				
				
				rules="\ncontent:\"\";\n";
				rules+="display:inline-block;\n";
				rules+="width:50px;\n";
				rules+="height:59px;\n";
				rules+="position:relative;\n";
				rules+="background:url(" + this.arrowRightImageURL + ");\n";
				rules+="background-repeat:no-repeat;\n";
				rules+="background-size:100%;\n";
				
				style.innerHTML += '.next-ownslide.imageType' + this.instanceNumber + ":before{" + rules + "}\n";
				
				document.getElementsByTagName('head')[0].appendChild(style);
				
				$(this.el).next("div.prev-ownslide").addClass("imageType" + this.instanceNumber);
				$(this.el).next("div.prev-ownslide").next().addClass("imageType" + this.instanceNumber);
		}
	}
	
	checkScreenWidth(){
		this.setScreenWidth($(window).width());
	}
	
	setScreenWidth(w){
		//console.log(w + "px");
		this.screenWidth = w;
		this.resizeSlider();
	}
	
	setSliderWidth(sliderWidth){
		this.sliderWidth = sliderWidth;
	}
	
	setSlideWidth(slideWidth){
		this.slideWidth = slideWidth;
	}
	
	setSlidesNumber(nbrSlides){
		this.slidesNumber=nbrSlides;
	}
	
	setShowSlides(showSlides){
		this.showSlides = showSlides;
	}
	
	setCurrentSlide(currentSlide){
		this.currentSlide = currentSlide;
	}
	
	setSlideMove(slideMove){
		this.slideMove = slideMove;
	}
	
	setCurrentShowSlides(currentShowSlides){
		this.currentShowSlides = currentShowSlides;
	}
	
	setSlideToScroll(slideToScroll){
		this.slideToScroll = slideToScroll;
	}
	
	setDelay(delay){
		this.delay = delay;
	}
	
	setMaxClones(maxClones){
		this.maxClones = maxClones;
	}
	
	setShowArrows(showArrows){
		this.showArrows = showArrows;
	}
	
	setArrowType(arrowType){
		this.arrowType = arrowType;
	}
	
	setArrowRightImageURL(arrowRightImageURL){
		this.arrowRightImageURL = arrowRightImageURL;
	}
	
	setArrowContent(arrowContent){
		this.arrowRightContent = arrowContent;
	}
	
	setArrowRightContentSize(arrowRightContentSize){
		this.arrowRightContentSize = arrowRightContentSize;
	}
	
	setSlideShadow(slideShadow){
		this.slideShadow = slideShadow;
	}
	
	pause(){
		window.clearInterval(timers[this.id]);
		timers[this.id]=false;
		//console.log("paused");
	}
	
	restart(){
		//console.log("restart");
		this.slide();
	}
	
	prepareSlides(){
		if(this.slidesNumber<=1){
			return;
		}
		else{
			//if(this.slidesNumber >1 && isEven(this.slidesNumber)){
			if(this.slidesNumber >1){
				let elemtArriere = [];
				let elemtAvt = [];
				let i = 0;
				let maxClone = (this.slidesNumber>4)? 4 : this.slidesNumber;
				let j = this.slidesNumber - 1;
				// Array.from($(this.el).find("div.own-slide")).forEach(function(div){
				// 	console.log(div);
				// });
				
				//création des clones de suite en nombre égale à this.slideToScroll à l'arriere et à l'avant
				for(i=0; i<maxClone;i++){
					elemtArriere.push($($(this.el).find("div.own-slide").get(i)).clone().addClass("clone"));
					elemtAvt.push($($(this.el).find("div.own-slide").get(j)).clone().addClass("clone"));
					j--;
				}
				//console.log(elemtArriere);
				//console.log(elemtAvt);
				
				for(i=0; i<maxClone;i++){
					elemtArriere[i].appendTo($(this.el).find("div.own-slider-track"));
					elemtAvt[i].prependTo($(this.el).find("div.own-slider-track"));
				}
				this.setMaxClones(maxClone);
				this.rewindSlider();
				
				return;
			}
		}
	}
	
	
	rewindSlider(pos = 0){
		this.setCurrentSlide(-pos+1);
		window.clearTimeout(timers[this.id]);
		timers[this.id]=false;
		if(this.slidesNumber>1){
			$(this.el)
				.find("div.own-slider-track")		
				.css({marginLeft: -((this.maxClones-pos) * this.slideWidth)});
		}
		else{
			$(this.el)
				.find("div.own-slider-track")		
				.css({marginLeft: 0});
		}
	}
	
	resizeSlider(){
		let slideWidth;
		let slideMove;
		let currentShowSlide;
		let slideToScroll;
		this.pause();
		//console.log($(this.el).parent().width());
		if(this.showArrows){
			$(this.el).next("div.prev-ownslide").css("display","block");
			$(this.el).next("div").next().css("display","block");
		}
		if($(this.el).parent().width()>1024){
			//console.log(this.screenWidth + 'px');
			//console.log(this.el);
			$(this.el).css("width","980px");
			
			if(this.showSlides>4){
				if(this.slidesNumber <= 4){
					currentShowSlide = this.slidesNumber;
					if(this.showArrows){
						$(this.el).next("div.prev-ownslide").css("display","none");
						$(this.el).next("div").next().css("display","none");
					}
				}
				else{
					currentShowSlide = 4;
				}
			}
			else{
				if(this.slidesNumber <= this.showSlides){
					currentShowSlide = this.slidesNumber;
					if(this.showArrows){
						$(this.el).next("div.prev-ownslide").css("display","none");
						$(this.el).next("div").next().css("display","none");
					}
				}
				else{
					currentShowSlide = this.showSlides;
				}
			}
			
			slideToScroll = (!this.slideToScroll || this.slideToScroll>4 || this.slideToScroll > currentShowSlide)? currentShowSlide : this.slideToScroll;
			slideWidth = (currentShowSlide == 1)? roundDecimal((980 / currentShowSlide), 2) : roundDecimal((980 / currentShowSlide), 2);
			slideMove = roundDecimal((slideToScroll * slideWidth) , 2);
			$(this.el).find("div.own-slide").css({width:slideWidth});
			
			this.resetSlider(980,currentShowSlide, slideMove, slideWidth);
			return;
		}
		if($(this.el).parent().width()>430 && $(this.el).parent().width()<=1024){
			//console.log(this.screenWidth + 'px');
			//console.log(this.el);
			$(this.el).css("width",($(this.el).parent().width()-56) + "px");
			
			if(this.showSlides>2){
				if(this.slidesNumber <= 2){
					currentShowSlide = this.slidesNumber;
					if(this.showArrows){
						$(this.el).next("div.prev-ownslide").css("display","none");
						$(this.el).next("div").next().css("display","none");
					}
				}
				else{
					currentShowSlide = 2;
				}
			}
			else{
				if(this.slidesNumber <= this.showSlides){
					currentShowSlide = this.slidesNumber;
					if(this.showArrows){
						$(this.el).next("div.prev-ownslide").css("display","none");
						$(this.el).next("div").next().css("display","none");
					}
				}
				else{
					currentShowSlide = this.showSlides;
				}
			}
			
			slideToScroll = (!this.slideToScroll || this.slideToScroll>2 || this.slideToScroll > currentShowSlide)? currentShowSlide : this.slideToScroll;
			slideWidth = (currentShowSlide == 1)? roundDecimal(($(this.el).parent().width()-56 / currentShowSlide), 2) : roundDecimal((($(this.el).width()/currentShowSlide)),2);
			slideMove = roundDecimal((slideToScroll * slideWidth ), 2);
			
			$(this.el).find("div.own-slide").css({width:slideWidth});
			this.resetSlider($(this.el).parent().width(),currentShowSlide, slideMove, slideWidth);
			return;
		}
		else{
			$(this.el).css("width",$(this.el).parent().width() + "px");
			
			currentShowSlide=1;
			slideWidth = $(this.el).parent().width();
			slideMove = slideWidth;
			
			$(this.el).find("div.own-slide").css({width:slideWidth});
			this.resetSlider($(this.el).parent().width(),1,slideMove,slideWidth);
		}
		this.restart();
	}
	
	resetSlider(sliderWidth, currentShowSlide, slideMove, slideWidth){
		this.setSliderWidth(sliderWidth);
		this.setSlideMove(slideMove);
		this.setCurrentShowSlides(currentShowSlide);
		this.setSlideWidth(slideWidth);
		//remettre la slide 1 en premier
		this.rewindSlider();
		window.clearInterval(timers[this.id]);
		timers[this.id]=false;
		this.slide();
	}
	
	previousSlide(){
		//console.log("clicked");
		if(this.inUse){
			return;
		}
		this.inUse=true;
		window.clearInterval(timers[this.id]);
		timers[this.id]=false;
		var slideMove = this.slideMove;
		var currentSlide = this.currentSlide;
		var currentShowSlides = this.currentShowSlides;
		var slideToScroll = (!this.slideToScroll || currentShowSlides == 1 || this.slideToScroll > currentShowSlides)? currentShowSlides : this.slideToScroll;
		var nextSlide;
		var pos;
		$(this.el).next("div.prev-ownslide").off("click");
		$(this.el).next("div").next().off("click");
		$(this.el)
			.find("div.own-slider-track")
			.animate(
				{marginLeft:"+=" + slideMove + "px"},
				1000,
				function(){
					if(currentSlide>0 && currentSlide-slideToScroll<=0){
						currentSlide -=1;
					}
					currentSlide -=  slideToScroll;
					nextSlide=currentSlide - slideToScroll;
					// console.log("currentSlide: " + currentSlide);
					// console.log("nextSlide:" + nextSlide);
					// console.log("slideToScroll:" + slideToScroll);
					// console.log("-this.maxClones:" + -this.maxClones);
					this.setCurrentSlide(currentSlide);
					
					if(nextSlide < -this.maxClones){
						pos = -(this.slidesNumber + currentSlide);
						this.rewindSlider(pos);
						
					}
					$(this.el).next("div.prev-ownslide").on("click",()=>{this.previousSlide();});
					$(this.el).next("div").next().on("click",()=>{this.nextSlide();});
					this.slide();
					this.inUse=false;
				}.bind(this));	
	}
	
	nextSlide(){
		if(this.inUse){
			return;
		}
		this.inUse=true;
		var slideMove = this.slideMove;
		var currentSlide = this.currentSlide;
		var currentShowSlides = this.currentShowSlides;
		var slideToScroll = (!this.slideToScroll || currentShowSlides == 1 || this.slideToScroll > currentShowSlides)? currentShowSlides : this.slideToScroll;
		var nextSlide;
		var pos;
		$(this.el).next("div.prev-ownslide").off("click");
		$(this.el).next("div").next().off("click");
		
		$(this.el)
			.find("div.own-slider-track")
			.animate(
				{marginLeft:"-=" + slideMove + "px"},
				1000,
				function(){
					
					currentSlide +=  slideToScroll;
					nextSlide=currentSlide + slideToScroll;
					//console.log(currentSlide);
					this.setCurrentSlide(currentSlide);
					
					if(nextSlide > this.slidesNumber){
						window.clearInterval(timers[this.id]);
						timers[this.id]=false;
						pos = this.slidesNumber - currentSlide + 1;
						this.rewindSlider(pos);
						this.slide();
					}
					
					if(nextSlide <= this.slidesNumber){
						$(this.el).next("div.prev-ownslide").on("click",()=>{this.previousSlide();});
						$(this.el).next("div").next().on("click",()=>{this.nextSlide();});
					}
					this.inUse=false;
				}.bind(this));
		
	}
	
	slide(){
		if(this.slidesNumber>this.currentShowSlides && !timers[this.id]){
			//console.log(timer);
			var t=this;
			timers[this.id] = window.setInterval(function(){t.nextSlide();}, this.delay);
			//console.log(timer);
		}
		else{
			window.clearInterval(timers[this.id]);
			timers[this.id]=false;
		}
	}	
	
}


(function( $ ){
$.fn.ownSliders = function(options={}) {
	return this.each(function()
    {
        makeSlider(this.id, options);
    });
  };
      
})( jQuery );




$(document).ready(function(){
	
	$("#slider1").ownSliders({
		showSlides : 4,
		slideToScroll : 2,
		delay : 3000,
		showArrows : true,
		arrowType : "content",
		arrowRightContent : "p",
		arrowRightContentSize : 2,
		slideShadow : false,
	});
	
	$("#slider2").ownSliders({
		arrowRightImageURL : "https://cpng.pikpng.com/pngl/s/288-2883770_right-arrow-comments-slider-arrow-icon-png-transparent.png",
	});
	
	console.log(sliderObjList);
	
	//const slider1 = makeSlider("slider1", {});
	
	//const slider2 = makeSlider("slider2", {});
	
	//console.log(slider1);
	//console.log(slider2);
	
});