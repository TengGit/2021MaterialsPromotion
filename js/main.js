(function(_, d, q, t){
	'use strict';
	var startSpace = 1000;
	var animateSpace = 2000;
	var pictureSpace = 1750;
	var buttonSpace = 1750;
	var w = 640, h = 1240, aspectRatio = w / h;
	
	var JPG_NUM = 19;
	var PNG_NUM = 32;
	var JPG_URL = "img/{0}.jpg";
	var PNG_URL = "img/{0}.png";

	function $(sel) {
		return d.querySelector(sel);
	}
	
	function r(str) {
		return q.getResult(str);
	}
	
	function remove(element) {
		element.parentNode.removeChild(element);
	}
	
	function subst(str) {
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(new RegExp('\\{' + (i - 1).toString() + '\\}', 'g'), arguments[i]);
		}
		return str;
	}
	
	function adjustPosition() {
		var root = $("#root");
		var sw = document.body.clientWidth, sh = document.body.clientHeight, w = sw, h = sh;
		if (w / h < aspectRatio) {
			h = w / aspectRatio;
		} else {
			w = h * aspectRatio;
		}
		root.style.width = w + "px";
		root.style.height = h + "px";
		root.style.top = (sh - h) / 2 + "px";
		root.style.left = (sw - w) / 2 + "px";
	}
	
	var res = [];
	
	for (var i = 0; i <= JPG_NUM; i++) {
		var idx = i.toString().padStart(2, '0')
		res.push({src: subst("img/{0}.jpg", idx), id: "j" + idx, type: t.IMAGE, preferXHR: false});
	}
	for (var i = 0; i <= PNG_NUM; i++) {
		var idx = i.toString().padStart(2, '0')
		res.push({src: subst("img/{0}.png", idx), id: "p" + idx, type: t.IMAGE, preferXHR: false});
	}
	
	var book = [[[Story.jmp, 22]], [[Story.clbg], [Story.ed, 'j05']], [[Story.clbg], [Story.ed, 'j06']], [[Story.clbg], [Story.bg, 'j04'], [Story.img, 'p04', 0, 306], [Story.choice, ['p05', 89, 664, 1], ['p06', 409, 664, 2]]], [[Story.clbg], [Story.ed, 'j08']], [[Story.clbg], [Story.ed, 'j09']], [[Story.clbg], [Story.bg, 'j07'], [Story.img, 'p08', 0, 357], [Story.choice, ['p09', 89, 589, 4], ['p10', 409, 589, 5]]], [[Story.clbg], [Story.bg, 'j03'], [Story.img, 'p03', 0, 330], [Story.choice, ['p07', 89, 646, 3], ['p11', 409, 646, 6]]], [[Story.clbg], [Story.ed, 'j11']], [[Story.clbg], [Story.bg, 'j10'], [Story.img, 'p13', 0, 284], [Story.choice, ['p14', 249, 708, 8]]], [[Story.clbg], [Story.bg, 'j02'], [Story.img, 'p02', 0, 258], [Story.choice, ['p12', 89, 742, 7], ['p15', 409, 742, 9]]], [[Story.clbg], [Story.ed, 'j06']], [[Story.clbg], [Story.ed, 'j14']], [[Story.clbg], [Story.bg, 'j13'], [Story.img, 'p18', 0, 313], [Story.choice, ['p19', 89, 653, 11], ['p20', 409, 653, 12]]], [[Story.clbg], [Story.bg, 'j12'], [Story.img, 'p17', 0, 342], [Story.choice, ['p21', 249, 626, 13]]], [[Story.clbg], [Story.bg, 'j01'], [Story.img, 'p01', 0, 275], [Story.choice, ['p16', 89, 715, 10], ['p22', 409, 715, 14]]], [[Story.clbg], [Story.ed, 'j17']], [[Story.clbg], [Story.ed, 'j11']], [[Story.clbg], [Story.bg, 'j16'], [Story.img, 'p25', 0, 342], [Story.choice, ['p26', 89, 614, 16], ['p27', 409, 614, 17]]], [[Story.clbg], [Story.ed, 'j19']], [[Story.clbg], [Story.bg, 'j18'], [Story.img, 'p29', 0, 345], [Story.choice, ['p30', 249, 600, 19]]], [[Story.clbg], [Story.bg, 'j15'], [Story.img, 'p24', 0, 339], [Story.choice, ['p28', 89, 611, 18], ['p31', 409, 611, 20]]], [[Story.bg, 'j00'], [Story.img, 'p00', 0, 209], [Story.choice, ['p23', 89, 821, 15], ['p32', 409, 821, 21]]]]

	_.addEventListener("load", function () {
		adjustPosition();
		
		q.on("progress", function (e) {
			var percent = Math.floor(e.progress * 100) + "%"
			$("#percent").textContent = percent;
			$("#progress-bar").style.width = percent;
		});
		
		q.on("complete", function () {
			$("#percent").textContent = "Loaded!";
			$("#progress-bar").style.width = "100%";
			
			var start = $("#start");
			start.style.visibility = "visible";
			var startTip = $("#click-to-start");
			startTip.style.visibility = "visible";
			
			fadeIn(startTip, startSpace).setData(start).then(function(o) {
				o.data.onclick = function () {
					this.onclick = null;
					fadeOutAndDelete($("#progress-container"), startSpace);
					fadeOutAndDelete(this, startSpace).then(function() {
						new Story(book, w, h, {trans: fadeIn, transArg: [animateSpace]}).start($("#root"));
					});
				};
			});
			
		});
		
		q.loadManifest(res);
	});
	
	_.addEventListener("resize", adjustPosition);
	
	_.resource = q;
})(window, document, new createjs.LoadQueue(), createjs.Types);