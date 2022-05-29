// pan swipe
// reel ribbon

import { afterUpdate } from 'svelte';
import { closest, morph } from './helpers'
import { animate, easing, back } from './animate'

export function nailer(node, {
  time = 1430,
  switchPoint = 100,
  calcA = 60,
  calcB = 4,
  calcTimeout = 100,
  leftShift = 0,
  rightShift = 0,
}={}) {

  // Affects
  let resizeObserver = new ResizeObserver(init)
  resizeObserver.observe(node.parentNode)

  // let mutationObserver = new MutationObserver(init)
  // mutationObserver.observe(node, {
  //   attributes: true,
  //   characterData: true,
  //   subtree: true,
  // });
  afterUpdate(init)

  // initial props
  let downX, downY, nodeX, nodeY, pathX, pathY, pointerX, pointerY, isInitiated = false;

  // Cacl force
  let force, vectorForce, Tmark, Xmark;

  // Events
  let event = (data) => new CustomEvent( "update", {
    bubbles: true,
    detail: data,
  });



  // Buttons Handlers
  function setBtn(node, direction){
    // node
  }

  function slideTo(direction){

    cancelAnimationFrame(node.NAILER.animation)
    let cords = node.NAILER.stepCords;
    let startPos = node.NAILER.x;

    if (direction == 'right'){
      for (let i = 0; i < cords.length; i++) {
        if( cords[i] >= startPos && startPos >= cords[i+1]) {
          if(cords[i] == startPos) {
            if (i + 1 < cords.length) slide(cords[i + 1])
            break
          } else {
            if (i + 2 < cords.length) slide(cords[i + 2])
            break
          }
        }
      }
    }

    if (direction == 'left'){
      for(var i = cords.length; i--;) {

        if( cords[i] <= startPos && startPos <= cords[i-1]) {
          if(cords[i] == startPos) {
            if (i-1 >= 0) slide(cords[i-1])
            break
          } else {
            if (i-2 >= 0) slide(cords[i-2])
            break
          }
        }
      }
    }

    function slide(point) {
      let calc = point - startPos;
      node.NAILER.animationId++
      animate({
        id: node.NAILER.animationId,
        node,
        duration: 1000,
        timing: easing.easeOutQuart,
        draw: (progress) => {
          node.style.transform = `translate(${startPos + (progress * calc)}px)`
          node.NAILER.x = startPos + (progress * calc)
          checkSliderPosition()
        },
      })
    }
  }

  function calcForce() {
    let Tcurr = performance.now();

    // flash every x ms
    if(Tcurr - Tmark < calcTimeout) return

    let Tdiff = Tcurr - Tmark;

    // calc posistion diff
    let diff = pointerX - Xmark > 0
      ? pointerX - Xmark
      : Xmark - pointerX ;
    let vectorDiff = pointerX - Xmark;

    force = diff/Tdiff
    vectorForce = vectorDiff/Tdiff

    // next loop
    Tmark = Tcurr
    Xmark = pointerX
  }

  // Calc step cords
  function calcSteps(){
    // We use Set Array for prevent double values
    // from multiline slider
    let stepCordsSet = new Set();
    let cards = node.children;

    // sizes
    let wrapperWidth = node.parentNode.clientWidth;
    // let margin = wrapperWidth - node.offsetWidth;
    let margin = node.offsetLeft * 2;
    let viewport = wrapperWidth - margin;

    // Find slider with without pseudo elements
    // by find most right element by calc offsetLeft + el.width
    // By using the method we do not depend on 'display' mode on slider
    let sliderWidth = 0;
    for(let card of cards) {
      let size = card.offsetLeft + card.offsetWidth;
      sliderWidth = size > sliderWidth ? size : sliderWidth;
    }

    let viewportOverflowWidth = sliderWidth - viewport;

    // console.log(wrapperWidth)
    // console.log(node.offsetWidth)
    // console.log(margin)
    // console.log(viewport)

    for(let card of cards) {
      if ( card.offsetLeft <= viewportOverflowWidth ){
        stepCordsSet.add( card.offsetLeft*-1 )
      } else if ( sliderWidth > viewport ) {
        stepCordsSet.add( (sliderWidth - wrapperWidth + margin + rightShift)/-1 )
        break
      }
    }

    // convert Set to Array, with check to empty
    // if it empty we set zero cord for other calcs
    // TODO cords mean that no scroll slider
    // - and we need to disable nailer by this condition
    let stepCords = stepCordsSet.size ? [...stepCordsSet] : [0];

    // Sort cords because we can get unsorted data from
    // multiline sliders
    stepCords.sort( (a, b) => b - a );

    // adds left shift for all item except first and last
    // we can do it only after sort, because slide can be multiline
    // and item on next line can be closer to left/right than first
    if(leftShift){
      for (let i = 1; i < stepCords.length - 1 ; i++) {
        stepCords[i] += leftShift
      }
    }

    node.NAILER.hiPoint = stepCords[stepCords.length-1]
    node.NAILER.stepCords = stepCords;
  }

  function checkSliderPosition(){
    // throttle
    if(!node.NAILER.throttleCheckOverflow) {

      node.NAILER.throttleCheckOverflow = true

      setTimeout(()=> {
        checkSliderPosition()
        node.NAILER.throttleCheckOverflow = false
      }, 50)

      return
    };

    // get bigger coordinate from cords array
    let lastCord = node.NAILER.stepCords[node.NAILER.stepCords.length-1];

    // console.log('x: ' + node.NAILER.x)
    // console.log('lc: ' + lastCord)

    // Overside starts
    // - left
    if( Math.round(node.NAILER.x) < 0 && !node.NAILER.overflowL) {
      node.NAILER.overflowL = true
      node.dispatchEvent(event({type: "overflowL", status: true}));
    }
    // - right
    if(	Math.round( node.NAILER.x) > lastCord && !node.NAILER.overflowR) {
      node.NAILER.overflowR = true
      node.dispatchEvent(event({type: "overflowR", status: true}));
    }

    //Overside ends
    // - left
    if( Math.round(node.NAILER.x) >= 0 && node.NAILER.overflowL){
      node.NAILER.overflowL = false
      node.dispatchEvent(event({type: "overflowL", status: false}));
     }
    // - right
    if(Math.round( node.NAILER.x) <= lastCord && node.NAILER.overflowR) {
      node.NAILER.overflowR = false
      node.dispatchEvent(event({type: "overflowR", status: false}));
    }
  }

  function checkOverflow(){
    if(node.scrollWidth <= node.parentNode.offsetWidth){
      if (isInitiated) release()
      return false
    } else {
      return true
    }
  }

  let stylesStore = new Set();

  function initStyles(styles){
    styles.forEach(prop => {
      let node = prop[0];
      let stl = prop[1];
      let value = prop[2];

      stylesStore.add(
        [ node, stl, node.style[stl]]
      )

      node.style[stl] = value
    });
  }

  function releaseStyles(){
    stylesStore.forEach(prop => {
      let node = prop[0];
      let stl = prop[1];
      let value = prop[2];
      node.style[stl] = value
    })
    isInitiated = false
  }

  function init(update){
    // if is destroyed
    // TODO it's fast fix for init after node is removed
    // Need to make onDestroy killer
    if( !node?.parentNode ) return;

    // Check overflow, have we hidden content for scroll
    if (!checkOverflow()) return;

    console.log(update ? 'update': 'init')
    node.addEventListener('mousedown', onDown);
    node.addEventListener('touchstart', onDown);

    if(!node.NAILER || update) node.NAILER = {
      x: 0,
      hiPoint: 0,
      animationId: 1,
      animDirection: null,
      isAnimated: false,
      isMovedTo: false,
    };


    // init styling
    if(!isInitiated) initStyles([
      [node, 'cursor', 'grab'],
      [node, 'touchAction', 'pan-y'],
      // BUG node.style.willChange = 'transform'
      // ↑ it causes a splash on mobile devices
      [node, 'transform', 'translate(0)'],
      // ↑ need to fix freeze over mouse move
      [node.parentNode, 'zIndex', '1'],
      [node.parentNode, 'overflow', 'hidden'],
      [node, 'zIndex', '1'],
    ])

    calcSteps()
    checkSliderPosition()
    isInitiated = true;
  }

  afterUpdate(()=>init(true))

  function release(){
    console.log('release')
    console.log(node)

    // Call to hide buttons
    node.dispatchEvent(event({type: "overflowL", status: false}));
    node.dispatchEvent(event({type: "overflowR", status: false}));

    // releaseStyles()

    // Remove listeners
    node.removeEventListener('mousedown', onDown);
    node.removeEventListener('touchstart', onDown);
    // releaseStyles()

    isInitiated = false
  }


  function onDown(e) {
    // Prevent click && drag on links
    if(e.type != "touchstart") e.preventDefault()

    calcSteps()

    // Stop All Animation by change anim id
    // TODO make reactive add speed if allready scroll
    // Prevent kill animation if we contine slide
    // on prev directoin
    node.NAILER.animationId++

    // cacl Force initial values
    downX = morph(e).clientX;
    downY = morph(e).clientY;
    Tmark = performance.now()
    Xmark = downX
    node.style.cursor = 'grabbing'


    // passive for improve browser animation
    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('mouseup', onUp, {passive: true});

    window.addEventListener('touchmove', onMove, {passive: true});
    window.addEventListener('touchend', onUp, {passive: true});
  }

  function onMove(e) {

    // Prevent click && drag on links
    node.onclick = () => false;

    pointerX = morph(e).clientX
    pointerY = morph(e).clientY
    pathX = pointerX - downX
    pathY = pointerY - downY
    nodeX = node.NAILER.x
    nodeY = node.NAILER.y

    // prevent scroll if is looks like vertical
    // it's just compare X:Y path distance
    // and if Y > 1.5X it's take as vert scroll
    let normal_pathX = pathX < 0 ? pathX * -1 : pathX;
    let normal_pathY = pathY < 0 ? pathY * -1 : pathY;
    if(normal_pathX < normal_pathY) return

    // corner grips
    let point = nodeX + pathX;
    let moveToPoint = point;
    let easePoint = pointerX // ← if is 0 nothing calculate
      ? nodeX + ( pathX / ( pointerX / ( pointerX / 5 )))
      : nodeX;


    // if is get over left border
    if (point > 0) {
      moveToPoint = easePoint
    }
    // if is get over right border
    if ((point) < node.NAILER.hiPoint ) {
      moveToPoint = easePoint
    }

    node.style.transform = `translate(${moveToPoint}px)`

    calcForce()

    node.NAILER.x = moveToPoint

    downX = morph(e).clientX

    // TODO infinity drag
    // need to calc windows size and position on screen
    // and move down point if pointer on edge
    // downX = morph(e).clientX + window.screenLeft
    // 	? morph(e).clientX >= window.screen.width-1
    // 		? morph(e).clientX - 6
    // 		: morph(e).clientX
    // 	: 6

    checkSliderPosition()
  }

  function onUp() {
    // Fixed issue when you drag a mouse
    // and freeze for some time at the end point
    calcForce()

    let closestPos = closest(node.NAILER.stepCords, node.NAILER.x);
    let startPos = node.NAILER.x;

    // force scroll
    let distance = calcA * vectorForce * calcB * vectorForce;
    let endPoint = vectorForce > 0
      ? startPos + distance
      : startPos - distance;

    let closesForcePoint = closest(node.NAILER.stepCords, endPoint);
    let duration = force * time;

    // prepare
    let _duration = duration > switchPoint &&
        // duration always more than 1000
        duration > 1000 &&
         // ↓ if is no scrollble set time to 1000
        startPos > node.NAILER.hiPoint &&
        startPos < 0
        ? duration < 1500
          ? duration
          : 1500
        : 1000;
    let finish = duration > switchPoint &&
        // duration always more than 1000
        duration > 1000 &&
        // ↓ if is no scrollble set time to 1000
        startPos > node.NAILER.hiPoint &&
        startPos < 0
        ? closesForcePoint
        : closestPos
    let calc = finish - startPos;


    node.NAILER.animDirection = finish < startPos ? 'left' : 'right';

    function makeEaseOut(timing) {
      return function(timeFraction) {
        return 1 - timing(1 - timeFraction);
      }
    }


    let timing = 0 < endPoint || endPoint < node.NAILER.hiPoint
      ?  node.NAILER.hiPoint < startPos && startPos < 0
        ? makeEaseOut(back)
        : easing.easeOutQuart
      : easing.easeOutQuart;


    animate({
      id: node.NAILER.animationId,
      node,
      duration: _duration,
      // timing: easing.easeOutQuart,
      timing,
      draw: (progress) => {
        node.style.transform = `translate(${startPos + (progress * calc)}px)`
        node.NAILER.x = startPos + (progress * calc)
        checkSliderPosition()
      },
    })

    node.style.cursor = 'grab'
    window.removeEventListener('mousemove', onMove, {passive: true});
    window.removeEventListener('mouseup', onUp, {passive: true});
    window.removeEventListener('touchmove', onMove, {passive: true});
    window.removeEventListener('touchend', onUp, {passive: true});

    // Allow click && drag by links
    // Timeout for prevent event after drag
    setTimeout(()=>{
      node.onclick = () => true;
    }, 1)

  }


  return {
    update(props) {
      if(props.time ) time = props.time
      if(props.switchPoint) switchPoint = props.switchPoint
      if(props.calcA) calcA = props.calcA
      if(props.calcB) calcB = props.calcB
      if(props.leftShift) leftShift = props.leftShift
      if(props.rightShift) rightShift = props.rightShift

      if(props.nextBtn) props.nextBtn.addEventListener(
        'click',()=>slideTo('right'), {passive: true}
        );
      if(props.prevBtn) props.prevBtn.addEventListener(
        'click',()=>slideTo('left'), {passive: true}
        );

    },
    destroy() {
      console.log('Destroed')
      node.removeEventListener('mousedown', onDown);
      node.removeEventListener('touchstart', onDown);
    }
  };

}