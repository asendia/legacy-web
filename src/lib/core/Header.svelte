<script lang="ts">
  import Logo from './warisin-logo.png';
</script>

<header class="header">
  <div class="iconWrapper">
    <img src={Logo} width={'30px'} height={'30px'} alt={'warisin logo'} />
    <div class="logoLine" style="left: -45px" />
    <div class="logoLine" style="right: -45px" />
  </div>
  <h1 class="heading">
    {'warisin'}
  </h1>
</header>

<style>
  .header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
  }
  .iconWrapper {
    position: relative;
  }
  .logoLine {
    position: absolute;
    bottom: 5px;
    width: 40px;
    height: 3px;
    background: #171717;
  }
  .heading {
    font-size: 1.3rem;
    margin: -5px 0 0;
    font-weight: lighter;
    letter-spacing: 2px;
  }
</style>
