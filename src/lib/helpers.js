import {animate, easing} from './animate'

export function scrollTo({
	elem,
	duration = 1000,
	start = 0,
	finish = 100,
	timing = easing.easeOutQuart
}) {
	let calc = finish - start;

	animate({
		duration: duration,
		timing: timing,
		draw: function(progress) {
			elem.style.transform = `translate(${start + (progress * calc)}px)`
			elem.SLIDER.x = start + (progress * calc)
		}
	})

};

export function closest(arr, target){
	return arr.reduce((prev, curr) => {
  	return (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
	});
}

export function morph(e) {
	return e.targetTouches ? e.targetTouches[0] : e
};

