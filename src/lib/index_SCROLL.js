// pan swipe
// reel ribbon

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
  // initial props
  let downX, nodeX, pathX, pointerX, nailerIsInit = false, stylesStore = new Set();

  // Calc force
  let force, vectorForce, Tmark, Xmark;

  // Run Script
  init()

  // ####  Affects  ####
  // Prevent observer first call
  let resObsInit;
  let resObs = new ResizeObserver(()=> resObsInit ? init() : resObsInit = true )
  resObs.observe(node.parentNode)

  let mutObs = new MutationObserver(()=>init(true));
  mutObs.observe(node.parentNode, {
    attributes: false,
    characterData: true,
    subtree: true,
    childList: true,
  });
  // ####   end    ####


  // Events
  let event = (data) => new CustomEvent( "update", {
    bubbles: true,
    detail: data,
  });

  function afterScroll() {
    if ( node.NAILER.isDrag ) return;
    node.NAILER.x = node.parentNode.scrollLeft * -1;
    checkOverside();
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
      nodeScroll()
      node.NAILER.animationId++
      let calc = point - startPos;
      let currAnimId = node.NAILER.animationId;
      animate({
        id: node.NAILER.animationId,
        node,
        duration: 1000,
        timing: easing.easeOutQuart,
        draw: (progress) => {
          node.style.transform = `translate(${startPos + (progress * calc)}px)`
          node.NAILER.x = startPos + (progress * calc)
          checkOverside()
        },
      }).then(() => {
        // Prevent set container overflow to scroll
        // if animate was break outside
        if ( currAnimId != node.NAILER.animationId ) return;

        // enable scroll
        nodeScroll(true)

        // Used by afterScroll function
        // Need for detect that the scroll is initiated by change css overflow model
        node.NAILER.isDrag = false;
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
  function storeCardsX(){
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
        stepCordsSet.add( card.offsetLeft * -1 )
      } else if ( sliderWidth > viewport ) {
        stepCordsSet.add( (sliderWidth - wrapperWidth + margin + rightShift) / -1 )
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

    node.NAILER.hiPoint = stepCords[stepCords.length - 1]
    node.NAILER.stepCords = stepCords;
  }

  function checkOverside(){
    // throttle
    if(!node.NAILER.throttleCheckOverflow) {

      node.NAILER.throttleCheckOverflow = true

      setTimeout(()=> {
        checkOverside()
        node.NAILER.throttleCheckOverflow = false
      }, 50)

      return
    };

    // get bigger coordinate from cords array
    let lastChildX = node.NAILER.stepCords[node.NAILER.stepCords.length-1];

    // Overside starts
    // - left
    if( Math.round(node.NAILER.x) < 0 && !node.NAILER.overflowL) {
      node.NAILER.overflowL = true
      node.dispatchEvent(event({type: "overflowL", status: true}));
    }
    // - right
    if(	Math.round( node.NAILER.x) > lastChildX && !node.NAILER.overflowR) {
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
    if(Math.round( node.NAILER.x) <= lastChildX && node.NAILER.overflowR) {
      node.NAILER.overflowR = false
      node.dispatchEvent(event({type: "overflowR", status: false}));
    }
  }

  function checkOverflow(){
    if(node.scrollWidth <= node.parentNode.offsetWidth){
      if (nailerIsInit) release()
      return false
    } else {
      return true
    }
  }

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
    node.parentNode.style.marginBottom = '';
    nailerIsInit = false
  }

  function setStyles(styles){
    styles.forEach(prop => {
      let node = prop[0];
      let stl = prop[1];
      let value = prop[2];
      node.style[stl] = value
    });
  }

  function init(update){
    // if is destroyed
    // TODO it's fast fix for init after node is removed
    // Need to make onDestroy killer
    if( !node?.parentNode ) return;

    // Check overflow, have we hidden content for scroll
    if (!checkOverflow()) return;

    // console.log(update ? 'update': 'init')
    node.addEventListener('mousedown', onDown);
    node.addEventListener('onscroll', checkOverflow);

    if(!node.NAILER) node.NAILER = {
      x: 0,
      hiPoint: 0,
      animationId: 1,
      animDirection: null,
      isAnimated: false,
      isMovedTo: false,
      isDrag: false,
      scrollBarHeight: 0,
    };

    // Need for update NAILER.x position, and check overside by scroll
    if(!update) node.parentNode.addEventListener('scroll', afterScroll);

    // If nodes was updated the scroll position can be updated too
    // We need to sync scroll position with node store
    // Scroll position must be always negative
    if(update) node.NAILER.x = node.parentNode.scrollLeft * -1;

    // init styling
    if(!nailerIsInit) initStyles([
      [node, 'cursor', 'grab'],
      [node, 'willChange', 'transform'],
      [node, 'zIndex', '1'],
      [node.parentNode, 'zIndex', '1'],
      [node.parentNode, 'overflow-x', 'scroll'],
    ])

    // Hide scrollbar
    if(!nailerIsInit){
      node.NAILER.scrollBarHeight = node.parentNode.offsetHeight - node.parentNode.clientHeight;
      node.parentNode.style.marginBottom = '-'+node.NAILER.scrollBarHeight+'px';
    }


    storeCardsX()
    checkOverside()
    nailerIsInit = true;
  }

  function release(){
    releaseStyles();

    // Call to hide buttons
    node.dispatchEvent(event({type: "overflowL", status: false}));
    node.dispatchEvent(event({type: "overflowR", status: false}));

    // Remove listeners
    node.removeEventListener('mousedown', onDown);
    nailerIsInit = false
  }

  function nodeScroll(enable){
    if(enable) {
      setStyles([
        [node.parentNode, 'overflow-x', 'scroll'],
        [node, 'transform', 'translate(0)'],
      ])
      node.parentNode.style.marginBottom = '-'+node.NAILER.scrollBarHeight+'px';
      // Scroll always positive, but x is negative
      // We make it positive by × -1
      node.parentNode.scrollLeft = node.NAILER.x * -1;
    } else {
      // Transform styles from scroll to transform:translate
      // NAILER.x always represent a real scroll position
      setStyles([
        [node, 'transform', `translate(${node.NAILER.x}px)`],
        [node.parentNode, 'overflow-x', 'hidden'],
        [node.parentNode, 'marginBottom', 0],
      ])

      // Reset scroll position for scroll by transition
      node.parentNode.scrollLeft = 0;
    }
  }

  function onDown(e) {
    // Prevent click for drag over links
    e.preventDefault()

    // Prevent drag by right click
    if(e.button == 2) return

    // Used by afterScroll function
    // Need for detect that the scroll is initiated by change css overflow model
    node.NAILER.isDrag = true;

    // Stop All Animation by change anim id
    // TODO Make reactive add speed if already scroll
    // TODO Prevent kill animation if we continue slide on prev direction
    node.NAILER.animationId++

    // disable scroll
    nodeScroll(false)

    // calc Force initial values
    downX = morph(e).clientX
    Tmark = performance.now()
    Xmark = downX

    node.style.cursor = 'grabbing'

    // passive for improve browser animation
    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('mouseup', onUp, {passive: true});
  }

  function onMove(e) {
    // Prevent click for drag over links
    node.onclick = () => false;

    pointerX = morph(e).clientX
    pathX = pointerX - downX
    nodeX = node.NAILER.x

    // corner grips
    let point = nodeX + pathX;
    let moveToPoint = point;
    let easePoint = nodeX // ← if is 0 nothing calculate
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

    // We need to calc force of scrolling
    // for right animate after realise
    calcForce()

    // Set new position of scroll
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

    checkOverside()
  }

  function onUp() {
    // Fixed issue when you drag a mouse
    // and freeze for some time at the end point
    calcForce()

    let closestPos = closest(node.NAILER.stepCords, node.NAILER.x);
    let startPos = node.NAILER.x;
    let currAnimId = node.NAILER.animationId;

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

    let finishPosition = finish > 0 ? finish : finish * -1;


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
      id: currAnimId,
      node,
      duration: _duration,
      timing,
      draw: (progress) => {
        progress = startPos + (progress * calc);
        node.style.transform = `translate(${progress}px)`
        node.NAILER.x = progress
        checkOverside()
      },
    }).then(() => {
      // Prevent set container overflow to scroll
      // if animate was break outside
      if ( currAnimId != node.NAILER.animationId ) return;


      // enable scroll
      nodeScroll(true)

      // Used by afterScroll function
      // Need for detect that the scroll is initiated by change css overflow model
      node.NAILER.isDrag = false;
    })

    node.style.cursor = 'grab'
    window.removeEventListener('mousemove', onMove, {passive: true});
    window.removeEventListener('mouseup', onUp, {passive: true});

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
        'click', () => slideTo('right'), { passive: true }
        );
      if(props.prevBtn) props.prevBtn.addEventListener(
        'click', () => slideTo('left'), { passive: true }
        );
    },
    destroy() {
      node.removeEventListener('mousedown', onDown);
      node.addEventListener('onscroll', checkOverflow);
    }
  };
}