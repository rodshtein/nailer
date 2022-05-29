<script>
  import { nailer } from './index_SCROLL';
  import { fly, fade } from 'svelte/transition';

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

	let props = {
    leftShift: 15
  };
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
  div
    .slider(use:nailer='{props}' on:update='{eventHandler}')
      slot


</template>

<style lang='postcss'>

.container {
  position: relative;
}

.left-side, .right-side {
  display: block;
  position: absolute;
  width: 1px;
  height: 100%;
  background: var(--color--border---devider);
  z-index: 2;
  transition: all .3s ease-out;
  @media(width < 800px){
    display: none
  }


  /* &::after
    content: ''
    pointer-events: none
    position: absolute
    display: block
    width: 62px
    top: 15px
    height: calc(100% - 30px)
    background-blend-mode: multiply */
}

.left-side {
  left: 70px;
  & button {
    right: 0;
  }
}

.right-side {
  right: 70px;
  & button {
    left: 0;
  }
}

button {
  position: absolute;
  background-color: transparent;
  border-width: 0;
  height: 100%;
  width: 67px;
  padding: 15px;
  cursor: pointer;

  &:after {
    content: '';
    display: block;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    width: 37px;
    height: 37px;
    background-color: rgb(162, 162, 162);
    transition: all .3s ease-out;
  }

  &:hover:after {
    background-color: red;
  }
}
.slider {
  display: flex;

  @media( 500px < width < 800px){
    margin: 0 30px;
  }
}


</style>