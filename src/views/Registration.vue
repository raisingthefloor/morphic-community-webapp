<template>
  <b-jumbotron class="bg-white" style="height: 77%; padding-top: 20px">
    <b-row style="width: 90vw; margin-left: auto; margin-right: auto">
      <b-col md="6" style="">
          <div class="mb-3">
              <h3 style="font-size: x-large; font-weight: bolder; color: #022957">New to Morphic?</h3>
              <div>Create an account with Morphic!</div>
          </div>
        <UserRegistration />
      </b-col>
      <b-col  class="bg-light" col md="6" style="padding-left: 80px; padding-bottom: 20px; padding-top: 20px; border-radius: 50px">
          <div style="display: flex; justify-content: space-around; align-items: center; color: #022957; margin-bottom: 20px">
              <img src="/img/logo-color.svg">
              <h4 style="font-weight: bolder; font-size: xx-large; margin-left: 10px;">Morphic is better with a Morphic account</h4>
          </div>
          <div style="margin-top: 10px">
              <div style="font-size: 20px; font-weight: bold; height: 50vh;">
                  <h4 style="font-weight: bold;">An account allow you to</h4>
                  <ul style="display: flex; align-items: center; flex-direction: column; justify-content: space-between; height: 60%; padding-right: 175px;">
                      <li>Back up your accessibility and usability settings to Morphic</li>
                      <li>Apply your settings quickly to any computer with Morphic on it</li>
                      <li>Make your own MorphicBar (with a subscription or if part of the <b-link>Early Release Program</b-link>)</li>
                  </ul>
              </div>
              <b-link style="color: inherit; text-decoration: none;" to="/">
                  <div style="height: 40px; border: 1px solid black; border-radius: 5px; width: 300px; display: flex; justify-content: center; align-items: center; margin-left: auto; margin-right: auto">
                      I already have a Morphic account
                  </div>
              </b-link>
          </div>
      </b-col>
    </b-row>
  </b-jumbotron>
</template>

<script>
import UserRegistration from "@/components/UserRegistration";

export default {
    components: {
        UserRegistration
    }
};
</script>
