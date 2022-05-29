// https://github.com/ariya/kinetic

// more easing https://gist.github.com/gre/1650294
export var easing = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

export function back(t) {
  let x = 1.5;
  return Math.pow(t, 2) * ((x + 1) * t - x)
}

function isBrowser(){
  try {
    return this === window;
  } catch(e) {
    return false;
  }
}



// animate helper
export function animate({timing, draw, duration, node, id}) {

  const requestAnimationFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame;

	return new Promise((resolve)=>{

    let start = performance.now();
    node.NAILER.isAnimated = true

		requestAnimationFrame(function an(time) {

			let timeFraction = (time - start) / duration;
			if (timeFraction > 1) timeFraction = 1;

      let progress = timing(timeFraction);

      if ( node.NAILER.animationId != id ) return resolve();

      draw(progress);

			if (timeFraction < 1) {
				requestAnimationFrame(an);
			} else {
        node.NAILER.isAnimated = false
        resolve()
      }
		});
	})
}

