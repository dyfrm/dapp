<template>
  <v-app id="inspire">

    <template v-if='this.getPkh === ""'>
      <LandingPage />
    </template>

    <template v-else>
      <AppPage />
    </template>

  </v-app>
</template>

<script>
import { mapGetters } from "vuex";

import LandingPage from "./views/LandingPage.vue";
import AppPage from "./views/AppPage.vue";

export default {
  name: "App",
  components: {
    LandingPage,
    AppPage
  },
  computed: {
    ...mapGetters(["getPkh"]),
  },
};
</script>
