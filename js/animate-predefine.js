(function(_) {
	_.nullTransistion = function () { return Animate.nullAnimation().start(); }
	
	_.fadeIn = function(elem, ms) {
		elem.style.opacity = 0;
		return new Animate(elem.style, {opacity: 1}, ms).setFunc(Animate.easeOut).start();
	}
	
	_.fadeOut = function(elem, ms) {
		elem.style.opacity = 1;
		return new Animate(elem.style, {opacity: 0}, ms).setFunc(Animate.easeOut).start();
	}
	
	_.fadeOutAndDelete = function(elem, ms) {
		elem.style.opacity = 1;
		return new Animate(elem.style, {opacity: 0}, ms).setFunc(Animate.easeOut).setData(elem).then(function(obj) { obj.data.parentNode.removeChild(obj.data); }).start();
	}
})(window);