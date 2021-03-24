<template>
  <b-jumbotron class="bg-white" style="height: 77%; padding-top: 20px">
    <b-row style="width: 90vw; margin-left: auto; margin-right: auto">
      <b-col md="6" style="">
          <div class="mb-3">
              <h3 style="font-size: x-large; font-weight: bolder; color: #022957">Sign up for Morphic to Accept</h3>
              <div>To accept your Morphic invitation and MorphicBar</div>
              <div>you need to create a Morphic account below (unless you</div>
              <div>already have a Morphic account )</div>
          </div>
        <UserRegistration back-link="Decline invitation" submit-button-text="Accept invitation & create account" create-account="I already have a Morphic account"  />
      </b-col>
      <b-col  class="bg-light" col md="6" style="padding-left: 80px; padding-bottom: 20px; padding-top: 20px; border-radius: 50px">
          <div style="display: flex; justify-content: space-around; align-items: center; color: #022957; margin-bottom: 20px">
              <img src="/img/logo-color.svg">
              <h4 style="font-weight: bolder; font-size: xx-large; margin-left: 10px;">Accept your Morphic invitation & MorphicBar</h4>
          </div>
          <div style="margin-top: 10px">
              <div style="font-size: 20px; font-weight: bold">
                  <h4 style="font-weight: bold;">A MorphicBar has a button for</h4>
                  <ul style="display: flex; align-items: flex-start; flex-direction: column; justify-content: flex-start; height: 30%; padding-right: 175px;">
                      <li>open website</li>
                      <li>Lunch apps and meetings</li>
                      <li>Changing settings</li>
                  </ul>
                  <b-link>How can Morphic help me?</b-link>
              </div>
              <div style="font-size: larger; font-weight: bold" class="fs">
                  <div class="mt-5"> The Person or Organization who invited you want to create and manage MorphicBar for you </div>
                  <div class="mt-5">They can make and update bars for yur computer. they cannot see or change other bars or things on your computer</div>
              </div>
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
