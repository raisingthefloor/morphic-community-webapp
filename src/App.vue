<template>
  <b-container fluid id="PageContainer" :class="focusMode ? 'focusMode' : 'dashboardMode'">
    <Header />
    <router-view />
    <Footer />
  </b-container>
</template>

<style lang="scss">
  $primary-color: #002957;
  $secondary-color: #84c661;

  body {
    font-family: 'Open Sans', sans-serif !important;
      a {
          color: #005BDF
      }
  }

  .fill-height {
    min-height: 100%;
  }
  .btn-primary {
    background-color: $primary-color !important;
    border-color: $primary-color !important;
  }
  .btn-success {
    background-color: $secondary-color !important;
    border-color: $secondary-color !important;
  }

  .bg-silver {
    background: #eee;
  }

  .text-bronze {
    color: #cd7f32;
  }

  .text-gold {
    color: gold;
  }

  .text-silver {
    color: silver;
  }

  .rounded {
    border-radius: 1rem;
  }

  #PageContainer {
    padding: 0;
  }

  .desktop {
    background: url(/img/background-editor.png);
    position: relative;
    display: flex;

    .preview-bar {
      padding-bottom: 5rem;
    }

    .openDrawerIconHolder {
      cursor: pointer;
      .b-icon {
        // margin-left: -19px;
        right: 104px;
        font-size: 2em;
        position: absolute;
        bottom: 25px;
        background: black;
        color: white;
        border-radius: 100%;
        border: 1px solid black;
      }
    }
  }

  .logoHolder {
    padding-top: 15px;
    padding-bottom: 15px;

    img {
      width: 3rem;
      height: 3rem;
    }
  }

  button.btn.btn-link {
    padding: 0;
    vertical-align: baseline;
    text-align: left;
  }

</style>

<script>
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default {
    name: "App",

    components: {
        Header,
        Footer
    }
};
</script>
