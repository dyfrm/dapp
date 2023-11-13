<template>
  <v-card>
    <v-toolbar dark color="black">

      <v-spacer></v-spacer>
      <v-toolbar-items>

      </v-toolbar-items>
    </v-toolbar>

    <div>

      <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
        <v-card class="mb-12" color="surface-variant" variant="tonal">

          <v-card-text class="text-medium-emphasis text-caption">
            Welcome to DFRAME. Connect your wallet to get started. </v-card-text>
        </v-card>

        <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="connectWallet">
          Connect Wallet
        </v-btn>

      </v-card>
    </div>

  </v-card>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data: () => ({
    test: ""
  }),
  methods: {
    ...mapActions(["connectWallet"]),
  }
}
</script>