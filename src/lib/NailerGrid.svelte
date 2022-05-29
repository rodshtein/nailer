<script>
  import { nailer } from '.';
  import { fly, fade } from 'svelte/transition';
  import { writable } from 'svelte/store';

  let overflowL = false;
	let overflowR = false;

	function eventHandler(e){
		if(e.detail.type == "overflowL") {
			overflowL = e.detail.status;
		}
		if(e.detail.type == "overflowR") {
			overflowR = e.detail.status;
		}
	}

	let props = writable({
    leftShift: 15
  });
</script>

<template lang='pug'>

.container
  +if('overflowL')
    .left-side(transition:fade='{{duration: 300}}')
      button(
        bind:this='{props.prevBtn}'
        transition:fly='{{duration: 400, x: 25}}'
        )
  +if('overflowR')
    .right-side(transition:fade='{{duration: 300}}')
      button(
        bind:this='{props.nextBtn}'
        transition:fly='{{duration: 400, x: -25}}'
      )

  .slider-wrapper(on:update='{eventHandler}')
    slot('{props}')


</template>

<style lang='postcss'>

.container
  position: relative
  margin:
    left: -15px
    right: -15px
  @media(width < 800px)
    margin:
      left: -30px
      right: -30px
    @media(width < 500px)
      margin:
        left: -15px
        right: -15px

  .left-side, .right-side
    display: block
    position: absolute
    width: 1px
    height: 100%
    background: var(--color--border---devider)
    z-index: 2
    transition: all .3s ease-out
    @media(width < 800px)
      display: none

    /* &::after
      content: ''
      pointer-events: none
      position: absolute
      display: block
      width: 62px
      top: 15px
      height: calc(100% - 30px)
      background-blend-mode: multiply */


  .left-side
    left: 0

    /* &::after
      right: -62px
      background:
        linear-gradient(
          90deg,
          rgba(85, 142, 213, 0.42) 0%,
          rgba(245, 247, 255, 0) 100%) */

    & button
      right: 0
      &:after
        background-image: url('/icons/25/short_arrow-l.svg')

  .right-side
    right: 0

    /* &::after
      right: 0
      background:
        linear-gradient(
          270deg,
          rgba(85, 142, 213, 0.42) 0%,
          rgba(245, 247, 255, 0) 100%) */

    & button
      left: 0
      &:after
        background-image: url('/icons/25/short_arrow-r.svg')

  & button
    position: absolute
    background-color: transparent
    border-width: 0
    height: 100%
    width: 67px
    padding: 15px
    cursor: pointer
    &:after
      content: ''
      display: block
      background-position: center
      background-repeat: no-repeat
      border-radius: 50%
      width: 37px
      height: 37px
      transition: all .3s ease-out

    &:hover:after
      background-color: var(--LIGHT-GRAY)

.slider-wrapper
  position: relative
  padding: 0
  padding:
    top: 15px
    bottom: 15px
  margin:
    top: -15px
    bottom: -15px

</style>