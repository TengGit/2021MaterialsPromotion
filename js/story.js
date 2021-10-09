'use strict';

var res = [];

(function(_) {
function setAttr(obj, attr) {
	for (var x in attr) {
		if (typeof attr[x] === "object" && attr[x] !== null) {
			setAttr(obj[x], attr[x]);
		} else {
			obj[x] = attr[x];
		}
	}
	return obj;
}

function create(name, opt) {
	var result = document.createElement(name);
	opt = opt || [];
	return setAttr(result, opt);
}

function resource(name, opt) {
	var result = _.resource.getResult(name);
	opt = opt || [];
	return setAttr(result, opt);
}

function rm(e) {
	e.parentNode.removeChild(e);
}

function d(a, b) {
	return a !== undefined ? a : b;
}

function da(a, i, b) {
	return a.length > i && a[i] !== undefined ? a[i] : b;
}

function percent(f) {
	return Math.round(f * 1000) / 10 + "%";
}

function wrap(f, obj) {
	return function () { f(obj); };
}

function getTrans(opt, data) {
	return d(opt.trans, d(data.trans, _.nullTransistion));
}

function getTransArg(opt, data) {
	return d(opt.transArg, d(data.transArg, []));
}

function Story(book, width, height, data) {
	this._book = book;
	this._width = width;
	this._height = height;
	this._data = data || {};
	this._chapter = 0;
	this._para = 0;
	this._background = null;
	this._imlist = [];
	this._container = null;
	this._bgcontainer = create("div", {className: "widget full", id: "background-container"});
	this._fgcontainer = create("div", {className: "widget full", id: "foreground-container"});
	this._animate = [];
	this._disabled = false;
	this._inclick = false;
}

function doTrans(target, opt) {
	var args = [target];
	opt = opt || {};
	var dt = getTransArg(opt, this._data);
	for (var x in dt) {
		args.push(dt[x]);
	}
	var result = getTrans(opt, this._data).apply(this, args);
	this._animate.push(result);
	return result;
}

function finishAll() {
	for (var i = 0; i < this._animate.length; i++) {
		this._animate[i].finish();
	}
	this._animate = [];
}

function changeScene() {
	this._animate && (finishAll.apply(this));
	var cur = this._book[this._chapter][this._para];
	cur[0].call(this, cur);
}

Story.prototype.start = function(container) {
	this._container = container;
	container.appendChild(this._bgcontainer);
	container.appendChild(this._fgcontainer);
	this._chapter = this._para = 0;
	changeScene.apply(this);
	container.addEventListener("click", wrap(function(obj) {
		obj._disabled || obj._inclick || (obj._inclick = true, obj.next(), obj._inclick = false);
	}, this));
}

Story.prototype.next = function() {
	if (++this._para >= this._book[this._chapter].length) {
		throw new RangeError("Non-ending chapter ended without a jump");
	}
	changeScene.apply(this);
}

Story.prototype.gotoChapter = function(val) {
	this._chapter = val;
	this._para = 0;
	for (var i = 0; i < this._imlist.length; i++) {
		this._fgcontainer.removeChild(this._imlist[i]);
	}
	this._imlist = [];
	changeScene.apply(this);
}

Story.prototype.disableClickNext = function() {
	this._disabled = true;
}

Story.prototype.enableClickNext = function() {
	this._disabled = false;
}

Story.clbg = function(opt) {
	this.disableClickNext();
	doTrans.call(this, this._background, {trans: window.fadeOut, transArg: d(this._data.transArg, [1500])}).then(wrap(function(obj) {
		obj._bgcontainer.removeChild(obj._background);
		obj._background = null;
		obj.enableClickNext();
		obj._fgcontainer.click();
	}, this));
}

Story.clsd = function(opt) {
	for (var i = 0; i < this._imlist.length; i++) {
		this._fgcontainer.removeChild(this._imlist[i]);
	}
	this._imlist = [];
	this._fgcontainer.click();
}
		
Story.bg = function(opt) {
	this.disableClickNext();
	var newBg = resource(opt[1], {className: "widget full"});
	if (this._background !== newBg) {
		doTrans.call(this, newBg, opt.length > 2 ? opt[2] : {}).then(wrap(function(obj) {
			var tar = obj[0];
			tar._background && tar._bgcontainer.removeChild(tar._background);
			tar._background = obj[1];
			tar.enableClickNext();
			obj[1].click();
		}, [this, newBg]));
		this._bgcontainer.appendChild(newBg);
	} else {
		this.enableClickNext();
		// this._background.click();
	}
}

function im(name, x, y, cw, ch, opt) {
	var result = resource(name, {
		className: "widget",
		style: {
			left: percent(x / cw),
			top: percent(y / ch),
		}
	});
	result.style.width = percent(d(opt.width, result.naturalWidth / cw));
	result.style.height = percent(d(opt.height, result.naturalHeight / ch));
	return result;
}

Story.img = function(opt) {
	var image = im(opt[1], opt[2], opt[3], this._width, this._height, da(opt, 4, {}));
	doTrans.call(this, image, opt.length > 4 ? opt[4] : {}).then(wrap(function(obj) { obj.click(); }, image));
	this._fgcontainer.appendChild(image);
	this._imlist.push(image);
}

Story.ed = function(opt) {
	this.disableClickNext();
	var newBg = resource(opt[1], {className: "widget full"});
	doTrans.call(this, newBg, opt.length > 2 ? opt[2] : {}).then(wrap(function(obj) {
		var tar = obj[0];
		tar._background && tar._bgcontainer.removeChild(tar._background);
		tar._background = null;
	}, [this, newBg]));
	this._fgcontainer.appendChild(newBg);
	this._imlist.push(newBg);
}

Story.jmp = function(opt) {
	this.gotoChapter(opt[1]);
}

Story.pause = function(opt) {
	;
}

Story.choice = function(opt) {
	this.disableClickNext();
	for (var i = 1; i < opt.length; i++) {
		var curOption = opt[i];
		var curImage = im(curOption[0], curOption[1], curOption[2], this._width, this._height, da(curOption, 4, {}));
		curImage.classList.add("option");
		doTrans.call(this, curImage, curOption.length > 4 ? curOption[4] : {}).then(wrap(function(obj) {
			obj[1].addEventListener("click", wrap(function(obj) {
				obj[0].enableClickNext();
				obj[0].gotoChapter(obj[1]);
			}, [obj[0], obj[2][3]]));
		}, [this, curImage, curOption]));
		this._fgcontainer.appendChild(curImage);
		this._imlist.push(curImage);
	}
}

_.Story = Story;

})(window);