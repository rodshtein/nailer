<script>
	import Nailer from '$lib/Nailer_SCROLL.svelte';
</script>


<template lang='pug'>
Nailer
  +each('Array(17) as el, i')
    .slider-item {i}
</template>

<style lang='postcss'>
.slider-item {
  position: relative;
  padding: 23px 19px;
  user-select: none;
  flex: 0 0 auto;
  width: calc(83% / 2);
  height: 250px;
  margin-right: 15px;

  background-color: lightgray;
	user-select: none;

  @media(width < 650px) {
    width: calc(83%)
  }

  @media(width < 400px){
    width: calc(100% - 30px)
  }

  &::before {
    content: '';
    position: absolute;
    left: -15px;
    right: -15px;
    top: -15px;
    bottom: -15px;
  }

  &:last-child {
    margin-right: 0;
  }
}

</style>

