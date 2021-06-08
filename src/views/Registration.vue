<template>
  <b-container id="RegistrationPage">
    <b-row>
      <b-col md="6" order-md="2">
        <div class="bg-light mt-5 p-4 rounded-lg">
          <div class="d-flex justify-content-around align-items-center">
            <img src="/img/logo-color.svg" alt="" class="mr-3">
            <h3>Morphic is better with a Morphic account</h3>
          </div>
          <div class="mt-4 lead font-weight-bold">
            <p class="h4">An account allows you to</p>
            <ul>
              <li>Back up your accessibility and usability settings to Morphic</li>
              <li>Apply your settings quickly to any computer with Morphic on it</li>
              <li>Make your own MorphicBar (with a subscription or if part of the <b-link>Early Release Program</b-link>)</li>
            </ul>
          </div>
        </div>
      </b-col>

      <b-col md="6">
          <div class="mb-3">
            <h2>New to Morphic?</h2>
            <div>Create your Morphic account now</div>
          </div>
        <UserRegistration back-link="I already have a Morphic account" submit-button-text="Sign up"/>
      </b-col>
    </b-row>
  </b-container>
</template>


<style lang="scss">

#RegistrationPage {
  h1, h2, h3 {
    color: #022957;
  }

  .rounded-lg {
    border-radius: 2em !important;
  }

  li {
    margin-top: 1em;
  }

}
</style>

<script>
import UserRegistration from "@/components/UserRegistration";

export default {
    components: {
        UserRegistration
    }
};
</script>
