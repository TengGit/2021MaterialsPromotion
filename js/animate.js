'use strict';
(function (_) {

var defaultFps = 25;

function callEach(arr, arg) {
	for (var i = 0; i < arr.length; i++) {
		arr[i].call(undefined, arg);
	}
}

function Animate(from, to, millisecond, propList) {
	this.reset(from, to, millisecond, propList || null);
}

var eps = 0.001;
function polynomial(coefficients, x) {
	var result = 0;
	for (var i = 0; i < coefficients.length; i++) {
		result = result * x + coefficients[i];
	}
	return result;
}
Animate.cubicBezier = function(x1, y1, x2, y2) {
	return function(x) {
		var p1 = [3 * x1 - 3 * x2 + 1, -6 * x1 + 3 * x2, 3 * x1, -x];
		var p2 = [9 * x1 - 9 * x1 + 3, -12 * x1 + 6 * x2, 3 * x1];
		var p3 = [3 * y1 - 3 * y2 + 1, -6 * y1 + 3 * y2, 3 * y1, 0];
		var t = polynomial(p1, x), delta = -polynomial(p1, t);
		while (Math.abs(delta) > eps) {
			t += delta / Math.max(polynomial(p2, t), 1);
			delta = -polynomial(p1, t);
		}
		return polynomial(p3, t);
	}
};

Animate.linear = function(t) { return t; }
Animate.easeIn = Animate.cubicBezier(.42, 0, 1, 1);
Animate.easeOut = Animate.cubicBezier(0, 0, .58, 1);
Animate.ease = Animate.cubicBezier(.25, .1, .25, 1);
Animate.easeInOut = Animate.cubicBezier(.42, 0, .58, 1);

Animate.prototype.start = function() {
	this._counter || (this._counter = setInterval(function(a) {
		a.progress(a._progress + a._step);
	}, this._interval, this));
	this._started = true;
	return this;
}

Animate.prototype.stop = function() {
	this._counter && (clearInterval(this._counter), this._counter = null);
	return this;
}

Animate.prototype.progress = function(val) {
	if (val < 0) val = 0;
	if (val > 1) val = 1;
	if (this._progress !== val) {
		this._progress = val;
		for (var x in this._first) {
			this.target[x] = this._first[x] + this._delta[x] * this._func(val);
		}
		callEach(this._callback, this);
		if (this._loop) {
			if (val == 1 && this._step > 0 || val == 0 && this._step < 0) {
				this._step = -this._step;
			}
		} else {
			val == 1 && callEach(this.stop()._onfinish, this);
		}
	}
	return this;
}

Animate.prototype.restart = function() {
	return this.stop().start();
}

Animate.prototype.cancel = function() {
	return this.stop().progress(0);
}

Animate.prototype.finish = function() {
	return this.stop().progress(1);
}

Animate.prototype.running = function() {
	return !!this._counter;
}

Animate.prototype.reset = function(from, to, millisecond, propList) {
	this.stop();
	this.target = from;
	this.data = null;
	this._ms = millisecond;
	this._step = 1000 / (millisecond * defaultFps);
	this._callback = [];
	this._interval = 1000 / defaultFps;
	this._counter = null;
	this._first = {};
	this._delta = {};
	this._progress = 0;
	this._onfinish = [];
	this._started = false;
	this._func = Animate.linear;
	this._loop = false;
	if (propList) {
		for (var x in propList) {
			var propName = propList[x];
			this._first[propName] = +from[propName];
			this._delta[propName] = to[propName] - this._first[propName];
		}
	} else {
		for (var propName in to) {
			this._first[propName] = +from[propName];
			this._delta[propName] = to[propName] - this._first[propName];
		}
	}
	return this;
}

Animate.prototype.animate = function(f) {
	this._callback.push(f);
	return this;
}

Animate.prototype.then = function(f) {
	this._onfinish.push(f);
	this._started && !this._counter && f.call(undefined, this);
	return this;
}

Animate.prototype.setData = function(d) {
	this.data = d;
	return this;
}

Animate.prototype.setFunc = function(f) {
	this._func = f;
	return this;
}

Animate.prototype.fps = function(val) {
	this._interval = 1000 / val;
	this._step = 1000 / (this._ms * val);
	this._counter && this.restart();
	return this;
}

Animate.prototype.loop = function(val) {
	this._loop = !!val;
}

Animate.nullAnimation = function () {
	var result = new Animate([], [], 1);
	result.start = function() {
		this._started = true;
		this.finish();
		return this;
	}
	result.progress = function() {
		this.stop();
		callEach(this._callback, this);
		callEach(this._onfinish, this);
		return this;
	}
	return result;
}

_.Animate = Animate;
})(window);
