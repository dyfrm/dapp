<template>
  <v-toolbar v-if="isMobile" density="compact" color="grey-darken-4">
    <v-app-bar-nav-icon @click.stop="drawerMainNav = !drawerMainNav"></v-app-bar-nav-icon>
    <v-toolbar-title>{{ updateToolbarTitle() }}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-navigation-drawer app v-model="drawerMainNav" class="bg-black">
    <v-list>
      <v-list-item @click.stop="drawerMainNav = !drawerMainNav" :title="formatTez(getPkh)" subtitle="Connected">
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact">
      <v-list-item prepend-icon="mdi-home" title="Home" value="Home" link to="/"></v-list-item>
      <v-list v-model:opened="openSubMenu">
        <v-list-group value="Frames">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Your Frames" prepend-icon="mdi-wallpaper"></v-list-item>
          </template>

          <v-list>
            <v-list-item v-for="(item, index) in getActiveFrame" :key="index" link :to="'/frame/' + item.id">
              <v-list-item-title class="ml-6">{{ item.id }}</v-list-item-title>
              <template v-slot:prepend>
                <v-icon icon="mdi-chevron-right"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-list-group>

        <v-list-group value="Collection">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Your Collection" prepend-icon="mdi-view-dashboard-outline"></v-list-item>
          </template>

          <v-list>
            <v-list-item v-for="(item, i) in itemsCollection" :key="i" :value="item" link :to="item.to"
              @click="getAllTokensByPlatform(getPkh, item.platform)">
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>
      </v-list>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact">
      <v-list-item prepend-icon="mdi-gift-outline" title="Donate" value="Donate"
        @click="dialogDonation = true"></v-list-item>
    </v-list>
    <template v-slot:append>
      <div class="pa-2">
        <v-btn depressed variant="plain" @click="disconnectWallet">
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-main>
    <template v-if="this.$route.path.indexOf('/frame') !== -1">

      <v-toolbar v-if="serverItemsFrame.length > 0" color="#212121">

        <v-btn color="#FF5400" variant="outlined" :href="openFrameURL(this.$route.params.id)" target="_blank" outlined>
          <v-icon color="#FF5400" start>mdi-play-circle-outline</v-icon> Play Frame
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn class="text-grey" @click="deleteFrameID(this.$route.params.id)" outlined>
          <v-icon color="#FF5400" start>mdi-trash-can-outline</v-icon> Delete Frame
        </v-btn>
      </v-toolbar>

      <template v-if="serverItemsFrame.length >= 0">

        <v-data-table-server v-model:items-per-page="itemsPerPageFrame" :search="searchFrame" :headers="headersFrame"
          :items-length="totalItemsFrame" :items="serverItemsFrame" class="elevation-1" item-value="name"
          @update:options="loadFrame(false, this.$route.params.id)">

          <template #[`item.thumb`]="{ item }">
            <v-img width="100" contain :src="IPFStoHTTP(item.selectable)" alt=":)">
            </v-img>
          </template>

          <template #[`item.name`]="{ item }">
            <span class="d-inline-block text-truncate" style="max-width: 100px;">
              {{ item.selectable.name }}
            </span>
          </template>

          <template #[`item.artist`]="{ item }">
            <span class="text-truncate">
              {{ formatTez(item.selectable.artist_address) }}
            </span>
          </template>

          <template #[`item.platform`]="{ item }">
            <v-chip>
              {{ item.selectable.platform }}
            </v-chip>
          </template>

          <template #[`item.action`]="{ item }">
            <v-btn @click="deleteFrameEntry(item.selectable.artifact_uri, this.$route.params.id)" flat class="mr-3"
              density="comfortable"> <v-icon color="#FF5400" start>mdi-trash-can-outline</v-icon></v-btn>
          </template>

        </v-data-table-server>
      </template>

      <template v-else>
        <v-container>
          <v-row>
            <v-col cols="12" md="12">
              <v-card class="mx-auto justify-center" max-width="500" color="transparent">
                <v-card-item>
                  <div>
                    <div class="text-overline mb-1">
                      You Don't Have Any Frames Yet
                    </div>
                    <div class="text-h6 mb-1">
                      How to create a diyFrame
                    </div>
                    <div class="text-headline">
                      1. Navigate to [collection]<br />
                      2. Click the [+] icon to add an artwork<br />
                      3. Choose [add to a new frame] in the dialog<br />
                      4. Open your [Tezos wallet] and approve the transaction to securely store your diyFrame on-chain
                    </div>
                  </div>
                </v-card-item>
                <v-card-actions>
                  <v-btn width="330" color="#FF5400" variant="flat" @click="openSubMenu = ['Collection']"
                    to="/collection/objkt">Go to your Collection</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <div v-if="getLoading" class="loader">
        LOADING
      </div>

      <v-card flat v-if="loadingWriteToContract">
        Writing updates to contract...
        <v-progress-linear :active="loadingWriteToContract" :indeterminate="loadingWriteToContract" absolute bottom
          color="deep-purple-accent-4"></v-progress-linear>
      </v-card>
    </template>

    <template v-if="this.$route.path === '/'">
      <v-container>
        <v-row>
          <v-col cols="12" md="12">
            <v-card class="mx-auto justify-center" max-width="500" color="transparent">
              <v-card-item>
                <div>
                  <div class="text-overline mb-1">
                    GET STARTED
                  </div>
                  <div class="text-h6 mb-1">
                    How to create a diyFrame
                  </div>
                  <div class="text-headline">
                    1. Navigate to [collection]<br />
                    2. Click the [+] icon to add an artwork<br />
                    3. Choose [add to a new frame] in the dialog<br />
                    4. Open your [Tezos wallet] and approve the transaction to securely store your diyFrame on-chain</div>
                </div>
              </v-card-item>
              <v-card-actions>
                <v-btn width="330" color="#FF5400" variant="flat" @click="openSubMenu = ['Collection']"
                  to="/collection/objkt">Go to your Collection</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-if="this.$route.path.indexOf('/collection') !== -1">
      <v-data-table-server v-model:items-per-page="itemsPerPageCollection" :search="searchCollection"
        :headers="headersCollection" :items-length="totalItemsCollection" :items="serverItemsCollection"
        class="elevation-1" item-value="name" @update:options="loadCollection">

        <template #[`item.thumb`]="{ item }">
          <v-img width="100" contain :src="IPFStoHTTP(item.selectable.token)" alt=":)">
          </v-img>
        </template>

        <template #[`item.name`]="{ item }">
          <span class="d-inline-block text-truncate" style="max-width: 100px;">
            {{ item.selectable.token.name }}
          </span>
        </template>

        <template #[`item.artist`]="{ item }">
          <span class="text-truncate" v-if="item.selectable.token">
            {{ formatTez(item.selectable.token.artist_address) }}
          </span>
        </template>

        <template #[`item.platform`]="{ item }">
          <v-chip>
            {{ item.selectable.token.platform }}
          </v-chip>
        </template>

        <template #[`item.action`]="{ item }">
          <v-btn flat class="mr-3"
            @click="dialogAddToFrame = true, this.addToFrameTemp = '', this.addToFrameTemp = item.selectable.token"
            density="comfortable"> <v-icon color="#FF5400">mdi-plus-circle</v-icon> </v-btn>
        </template>

      </v-data-table-server>
    </template>
  </v-main>

  <v-navigation-drawer v-model="drawerAd" location="right">
    <v-list-item nav>
      <template v-slot:append>
        <v-btn variant="text" icon="mdi-close" @click="drawerAd = false"></v-btn>
      </template>
    </v-list-item>

    <v-card-item>
      <div>
        <div class="text-overline mb-2">
          AD
        </div>
        <v-img src="https://blog.re-tain.xyz/Re%E2%80%94tain_Logo_Color-F0FF42.svg" width="100px" class="mb-2"></v-img>
        <div class="mb-1">
          New Generative Art Platform on Tezos
        </div>
        <div class="text-caption">Re—tain lets you deploy generative art on your own Tezos smart contract.</div>
      </div>
    </v-card-item>

    <v-card-actions>
      <v-btn href="https://re-tain.xyz/?ref=diyframe.xyz" target="_blank" block variant="outlined">
        re-tain.xyz
      </v-btn>
    </v-card-actions>

    <template v-slot:append>
      <v-btn class="mb-2" size="x-small" plain block flat href="mailto:andre@diyframe.xyz?subject=Advertise"
        target="_blank"> Advertise here
      </v-btn>
    </template>

  </v-navigation-drawer>

  <v-dialog v-model="dialogDonation" persistent scrollable max-width="500" min-width="330"
    transition="dialog-top-transition">

    <v-card flat class="rounded-lg">
      <v-toolbar dark color="grey">
        <v-btn icon dark @click="dialogDonation = false" to="/">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>DONATE</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-card-text class="text-center align-center justify-center">
        <v-avatar color="grey" size="100" rounded="lg">
          <v-img cover src="https://andrefuchs.xyz/avatar.png"></v-img>
        </v-avatar>
      </v-card-text>

      <v-card-text v-if="this.operationHash === 'success'">
        Your generous donation is truly appreciated!<br />
        Thank you.<br />
        🧡 🦊️
      </v-card-text>

      <v-card-text v-else-if="this.operationHash === 'error'">
        An error happened. You can also send your donation directly to andrefuchs.tez.<br />
        Thank you!<br />
        🧡 🦊️
      </v-card-text>

      <v-card-text>
        Please consider making a donation to support Andre Fuchs, the dedicated sole developer behind
        diyFrame.<br /><br />
        You can choose an amount from the options below or send your donation directly to andrefuchs.tez.
      </v-card-text>

      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <span class="subheading">Select an amount</span>
        <v-chip-group v-model="selectionDonate" selected-class="text-red" mandatory>
          <v-chip v-for="amount in amounts" :key="amount" size="x-large" :value="amount">
            {{ amount }} tez
          </v-chip>
        </v-chip-group>
      </v-card-text>

      <v-card-actions>
        <v-btn color="#FF5400" variant="flat" block @click="makeDonation()">Donate {{ selectionDonate }} tez Now</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogAddToFrame" scrollable max-width="500" min-width="330">
    <v-card flat class="rounded-lg">
      <v-toolbar dark color="grey">
        <v-btn icon dark @click="dialogAddToFrame = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-inline-block text-truncate" style="max-width: 300px;">ADD: “{{ this.addToFrameTemp.name
        }}”</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-list-item>
        <v-btn variant="outlined" class="mt-4" block @click="submitNewFrameWithEntry(this.addToFrameTemp)" depressed
          color="#FF5400">
          ADD TO A NEW FRAME
        </v-btn>
      </v-list-item>
      <v-card-text>
        or select a frame:
      </v-card-text>
      <v-card-text style="height: 300px;">
        <v-radio-group v-model="dialogRadiosAddFrame" column>
          <div v-for="(item, index) in getActiveFrame" :key="index">
            <v-radio color="#FF5400" @click="this.addItemIDTemp = '', this.addItemIDTemp = item.id"
              :label="'Frame ' + item.id" :value="item.id"></v-radio>
          </div>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-btn color="#FF5400" variant="flat" block
          @click="dialogAddToFrame = false, loadFrame(true, this.addItemIDTemp)">SAVE</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogImport" scrollable max-width="500" min-width="330">
    <v-card flat class="rounded-lg">
      <v-toolbar dark color="grey">
        <v-btn icon dark @click="goToFirstFrame(), dialogImport = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-inline-block text-truncate" style="max-width: 300px;">Import: “{{
          this.addToFrameTemp.name }}”</v-toolbar-title>
      </v-toolbar>
      <v-img :src="this.IPFStoHTTP(this.addToFrameTemp)" class="align-end"
        gradient="to top, rgba(0,0,0,.1), rgba(0,0,0,.8)" height="125px" cover>
        <v-card-title>
          Artist: {{ this.addToFrameTemp.name }}<br />
          Token ID: {{ this.addToFrameTemp.token_id }}
        </v-card-title>
      </v-img>
      <v-list-item>
        <v-btn variant="outlined" class="mt-4" block @click="submitNewFrameWithEntry(this.addToFrameTemp)" depressed
          color="#FF5400">
          ADD TO A NEW FRAME
        </v-btn>
      </v-list-item>
      <v-card-text>
        or select a frame:
      </v-card-text>
      <v-card-text style="height: 300px;">
        <v-radio-group v-model="dialogRadiosAddFrame" column>
          <div v-for="(item, index) in getActiveFrame" :key="index">
            <v-radio color="#FF5400" @click="this.addItemIDTemp = '', this.addItemIDTemp = item.id"
              :label="'Frame ' + item.id" :value="item.id"></v-radio>
          </div>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-btn color="#FF5400" variant="flat" block
          @click="goToFirstFrame(), dialogAddToFrame = false, loadFrame(true, this.addItemIDTemp)">SAVE</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { formatPkhString } from "../utils";
import { VDataTableServer } from 'vuetify/lib/labs/components.mjs'

const queryAllTokensByCollector = `query TokensByCollector($address: String!, $platform: String!,  $showAmount: Int ) {
   holdings(where: {holder_address: {_eq: $address}, amount: {_gt: "0"}, token: {platform: {_eq: $platform}}}, order_by: {last_received_at: desc}, limit: $showAmount) {
    token {
     platform
     fa2_address
     objkt_artist_collection_id
     token_id
     name
     description
     updated_at
     thumbnail_uri
     mime_type
     artist_address
      artist_profile {
      alias
     }
   }
}`;

const querySingleToken = `query GetSingleToken($fa2Address: String = "", $tokenId: String = "") {
    tokens_by_pk(fa2_address: $fa2Address, token_id: $tokenId) {
        name
    artist_profile {
        alias
      }
       artist_address
       objkt_artist_collection_id
       fa2_address
       token_id
       platform
       artifact_uri
       display_uri
       thumbnail_uri
       mime_type
    }  
}
`;

export default {
  name: "App",
  components: {
    VDataTableServer,
  },
  data: () => ({
    ghostnet: true,
    drawerMainNav: true,
    amounts: [5, 10, 50, 100],
    selectionDonate: 10,
    addToFrameTemp: "",
    addItemIDTemp: "",
    dialogAddToFrame: false,
    operationHash: null,
    drawerAd: true,
    openSubMenu: [],
    itemsCollection: [
      { text: 'fx(hash)', icon: 'mdi-chevron-right', to: '/collection/fxhash', platform: 'FXHASH' },
      { text: 'Objkt', icon: 'mdi-chevron-right', to: '/collection/objkt', platform: 'OBJKT' },
      { text: 'Teia', icon: 'mdi-chevron-right', to: '/collection/teia', platform: 'HEN' },
      { text: 'Versum', icon: 'mdi-chevron-right', to: '/collection/versum', platform: 'VERSUM' },
    ],
    dialogRadios: '',
    dialogRadiosAddFrame: '',
    dialogImport: false,
    dialogDonation: false,
    headersFrame: [
      {
        title: 'Thumb',
        value: 'token.thumbnail_uri',
        align: 'start',
        sortable: false,
        key: 'thumb',
      },
      {
        title: 'Title',
        value: 'token.name',
        align: 'start',
        sortable: false,
        key: 'name',
      },
      { title: 'Artist', value: 'token.artist_address', key: 'artist', align: 'start', sortable: false },
      { title: 'Platform', value: 'token.platform', key: 'platform', align: 'start', sortable: false },
      { title: 'Delete', key: 'action', align: 'start', sortable: false },
    ],
    headersCollection: [
      {
        title: 'Thumb',
        value: 'token.thumbnail_uri',
        align: 'start',
        sortable: false,
        key: 'thumb',
      },
      {
        title: 'Title',
        value: 'token.name',
        align: 'start',
        sortable: false,
        key: 'name',
      },
      { title: 'Add', key: 'action', align: 'start', sortable: false },
      { title: 'Artist', value: 'token.artist_address', key: 'artist', align: 'start', sortable: false },
      { title: 'Platform', value: 'token.platform', key: 'platform', align: 'start', sortable: false },
    ],
    itemsPerPageCollection: 10,
    itemsPerPageFrame: 10,
    searchCollection: '',
    searchFrame: '',
    serverItemsCollection: [],
    serverItemsFrame: [],
    totalItemsCollection: 0,
    totalItemsFrame: 0,
    loadingWriteToContract: false,
  }),

  mounted() {
    this.$watch(() => this.$route.path, () => {
      window.scrollTo(0, 0)

      if (this.$route.path.indexOf('/collection/') !== -1) {
        this.searchCollection = String(Math.random())
      }
      else if (this.$route.path.indexOf('/add') !== -1) {
        this.getShareParams()
      }
      else if (this.$route.path.indexOf('/donate') !== -1) {
        this.dialogDonation = true
      }
      else if (this.$route.path.indexOf('/frame/') !== -1) {
        this.searchFrame = String(Math.random())
      }
    })

    this.$nextTick(function () {
      if (this.isMobile) {
        this.drawerMainNav = false
        this.drawerAd = false
      }

      const checkLogin = this.getPkh
      if (checkLogin === "" || checkLogin === undefined || checkLogin === null) {

        if (this.$route.path.indexOf('/frame/') !== -1) {
          this.searchFrame = String(Math.random())
        }
      }
    })
  },
  computed: {
    ...mapGetters(["getConnected", "getPkh", "getActiveFrame", "getLoading"]),

    isMobile() {
      return window.innerWidth <= 400;
    }
  },
  watch: {
    getConnected(newValue) {
      if (newValue) {
        this.getFrameList();
      }
    }
  },
  created() {
    this.checkWalletConnection();
  },
  methods: {
    ...mapActions(["donateNow", "addFrame", "checkWalletConnection", "getFrameList", "disconnectWallet", "updateFrame", "deleteFrame", "connectWallet"]),
    getPkhBridge() {
      if (this.ghostnet) {
        console.log("Tezos Ghostnet");
        return "tz1ZEoCxEKW6fPZv8LZrpu2N6DBZcCCqMS6v"
      } else {
        return this.getPkh()
      }
    },
    updateToolbarTitle() {
      return "diyFrame"
    },
    goToFirstFrame() {
      const frames = this.getActiveFrame
      if (frames.length > 0) {
        this.$router.push('/frame/' + frames[0].id)
      } else {
        this.$router.push('/frame')
      }
    },
    openFrameURL(valFrameID) {
      return "https://play.diyframe.xyz/" + valFrameID
    },
    toggleFullScreen(event) {
      var element = document.body;
      if (event instanceof HTMLElement) {
        element = event;
      }
      var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
      element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
      document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };
      isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
    },
    async deleteFrameEntry(val, valID) {
      let entryFound = null;
      for (let i = 0; i < this.serverItemsFrame.length; i++) {
        if (this.serverItemsFrame[i].artifact_uri === val) {
          entryFound = this.serverItemsFrame[i];
          break;
        }
      }
      if (entryFound !== null) {
        const indexToDelete = this.serverItemsFrame.findIndex(obj => obj.artifact_uri === val);
        this.serverItemsFrame.splice(indexToDelete, 1);
        let newServerItemsFrame = []
        for (let i = 0; i < this.serverItemsFrame.length; i++) {
          newServerItemsFrame += this.serverItemsFrame[i].token_id + "," + this.serverItemsFrame[i].fa2_address + ","
        }
        if (this.serverItemsFrame.length === 0) {
          this.deleteFrameID(valID)
        } else {
          await this.updateFrame({ frame: newServerItemsFrame, id: valID });
        }
      } else {
        console.log("Object not found.");
      }
    },
    formatTez(val) {
      if (val != null) {
        return val.substring(0, 5) + "..." + val.substring(val.length - 4);
      }
    },
    async getAllTokensByPlatform(address, platform) {
      const { errors, data } = await this.fetchGraphQL(queryAllTokensByCollector, "TokensByCollector", { "address": address, "platform": platform, "showAmount": this.itemsPerPageCollection });
      if (errors) {
        console.error(errors);
      } else {
        return data
      }
    },
    async connectWalletBridge() {
      const result = await this.connectWallet();
      if (result === "success") {
        this.dialogLanding = false
        this.$router.push('/#')
      }
    },
    async makeDonation() {
      const result = await this.$store.dispatch('donateNow', this.selectionDonate);
      this.operationHash = result;
    },
    async deleteFrameID(id) {
      await this.deleteFrame(id);
    },
    async submitNewFrameWithEntry(val) {
      let payload = val;
      payload = this.addToFrameTemp.token_id + "," + this.addToFrameTemp.fa2_address
      const result = await this.addFrame(payload);
      if (result === "success") {
        this.dialogAddToFrame = false
        this.dialogImport = false
      } else {
        this.dialogAddToFrame = false
        this.dialogImport = false
      }
    },
    IPFStoHTTP(val) {
      val = this.pickTokenDisplayUri(val)
      val = val.uri
      if (val) {
        return val.split('ipfs://').join('https://ipfs.io/ipfs/')
      }
    },
    pickTokenDisplayUri(token) {
      if (
        token.platform === 'FXHASH' &&
        token.thumbnail_uri &&
        token.thumbnail_uri === 'ipfs://QmbvEAn7FLMeYBDroYwBP8qWc3d3VVWbk19tTB83LCMB5S' &&
        token.fx_collection_display_uri
      ) {
        return {
          uri: token.fx_collection_display_uri,
        };
      }

      if (!token.display_uri && token.thumbnail_uri === 'ipfs://QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc') {
        // HEN, early mints
        return {
          uri: token.artifact_uri,
          is_video: token.mime_type === 'video/mp4',
        };
      }

      if (
        token.platform === 'VERSUM' &&
        (token.mime_type === 'image/gif' ||
          token.mime_type === 'image/jpeg' ||
          token.mime_type === 'image/png' ||
          token.mime_type === 'image/jpg')
      ) {
        return {
          uri: token.artifact_uri,
        };
      }

      if (token.platform === 'VERSUM' && parseInt(token.token_id, 10) <= 27951 && token.mime_type === 'video/mp4' && token.formats !== undefined) {
        // the video was used in the display_uri in the early versum days. pick first jpg in formats instead.
        try {
          const jpgFormat = token.formats.find((format) => format.mime_type === 'image/jpeg');

          if (jpgFormat) {
            return {
              uri: jpgFormat.uri,
            };
          }
        } catch (err) {
          console.log("ERROR: ", err);
        }
      }

      return {
        uri: token.display_uri || token.thumbnail_uri,
      };
    },
    async fetchGraphQL(operationsDoc, operationName, variables) {
      const result = await fetch(
        "https://api.teztok.com/v1/graphql",
        {
          method: "POST",
          body: JSON.stringify({
            query: operationsDoc,
            variables: variables,
            operationName: operationName
          })
        }
      );
      return await result.json();
    },
    async loadFrame(valUpdate, valID) {
      this.serverItemsFrame.length = 0
      const frames = this.getActiveFrame
      if (frames === undefined) {
        return
      }
      let getIndex = 0
      if (frames.length > 0) {
        for (let i = 0; i < frames.length; i++) {
          if (frames[i].id === valID) {
            getIndex = i;
            break;
          }
        }
        var valuePairs = frames[getIndex]["frame"]
        const values = valuePairs.split(',');
        const pairs = [];
        for (let i = 0; i < values.length; i += 2) {
          if (i + 1 < values.length) {
            pairs.push([values[i], values[i + 1]]);
          }
        }
        for (let i = 0; i < pairs.length; i++) {
          await this.fetchSingleToken(pairs[i][0], pairs[i][1])
        }
      } else {
        console.log("No content found between brackets.");
      }
      if (valUpdate) {
        let newEntry = this.addToFrameTemp.token_id + "," + this.addToFrameTemp.fa2_address
        let serverItemsFrameNew = ""
        for (let i = 0; i < this.serverItemsFrame.length; i++) {
          serverItemsFrameNew += this.serverItemsFrame[i].token_id + "," + this.serverItemsFrame[i].fa2_address + ","
        }
        const result = await this.updateFrame({ frame: serverItemsFrameNew + newEntry + ",", id: valID });
        if (result === "success") {
          this.dialogAddToFrame = false
          this.dialogImport = false
        } else {
          this.dialogAddToFrame = false
          this.dialogImport = false
        }
      }
    },
    async loadCollection() {
      let platformFilter = "'FXHASH', 'OBJKT', 'HEN', 'VERSUM'"
      if (this.$route.path.indexOf('/collection/fxhash') !== -1) {
        platformFilter = "FXHASH"
      } else if (this.$route.path.indexOf('/collection/objkt') !== -1) {
        platformFilter = "OBJKT"
      } else if (this.$route.path.indexOf('/collection/teia') !== -1) {
        platformFilter = "HEN"
      } else if (this.$route.path.indexOf('/collection/versum') !== -1) {
        platformFilter = "VERSUM"
      }
      const { errors, data } = await this.fetchGraphQL(queryAllTokensByCollector, "TokensByCollector", { "address": this.getPkhBridge(), "platform": platformFilter, "showAmount": this.itemsPerPageCollection });
      if (errors) {
        console.error(errors);
      } else {
        this.serverItemsCollection = data.holdings
      }
    },
    getUsername(valAlias, valTezosAddress) {
      if (valAlias == "" || valAlias === null || valAlias === undefined) {
        return formatPkhString(valTezosAddress)
      } else {
        return valAlias
      }
    },
    async fetchSingleToken(token, address) {
      const { errors, data } = await this.fetchGraphQL(querySingleToken, "GetSingleToken", { "fa2Address": address, "tokenId": token });
      if (errors) {
        console.error(errors);
      } else {
        this.serverItemsFrame.push(data.tokens_by_pk)
      }
    },
    async getShareParams() {
      const { errors, data } = await this.fetchGraphQL(querySingleToken, "GetSingleToken", { "fa2Address": this.$route.query.fa2_address, "tokenId": this.$route.query.token_id });
      if (errors) {
        console.error(errors);
      } else {
        this.dialogImport = true
        if (this.$route.query.token_id !== undefined && this.$route.query.fa2_address !== undefined) {
          this.addToFrameTemp = data.tokens_by_pk
        }
      }
    },
  },
};
</script>