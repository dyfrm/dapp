import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { ColorMode, NetworkType, TezosOperationType } from "@airgap/beacon-sdk";
import { CONTRACT_ADDRESS } from "@/utils";
import BigNumber from "bignumber.js";

const network = { type: NetworkType.GHOSTNET };
const Tezos = new TezosToolkit("https://ghostnet.tezos.marigold.dev");

const wallet = new BeaconWallet({
  name: "DFRAME",
  preferredNetwork: network.type,
});

Tezos.setWalletProvider(wallet);
wallet.client.setColorMode(ColorMode.DARK);

const getContract = async () => await Tezos.wallet.at(CONTRACT_ADDRESS);

export default {
  async connectWallet({ dispatch }) {
    try {
      await wallet.requestPermissions({
        network: network,
      });
      dispatch("checkWalletConnection");
      return "success";
    } catch (error) {
      console.log(">connectWallet >Error: ", error);
      return "error";
    }
  },

  async donateNow({ dispatch }, payload) {
    try {
      const hash = await wallet.sendOperations([
        {
          kind: TezosOperationType.TRANSACTION,
          destination: 'tz1Wd3rTuL1nZ62d1V9LtjYRtjJuD7vg6aSc', // = diyframe.tez 
          amount: payload * 1000000,
        },
      ]);

      if (hash === "thiswillneverfire") {
        dispatch("softUpdateFrameList");
      }

      return "success";

    } catch (error) {
      console.log(error);
      return "error";
    }
  },

  async checkWalletConnection({ commit }) {
    try {
      const activeAccount = await wallet.client.getActiveAccount();
      let pkh;

      if (activeAccount) {
        pkh = activeAccount.address;
        commit("updatePkh", pkh);
        commit("updateConnected", true);
      } else {
        commit("updatePkh", "");
        commit("updateConnected", false);
      }
    } catch (error) {
      console.log(error);
    }
  },

  async disconnectWallet({ dispatch }) {
    await wallet.clearActiveAccount();
    dispatch("checkWalletConnection");

    try {
      const account = await wallet.getPKH();
      console.log("___disconnectWallet account", account);
    } catch {
      console.log("___disconnectWallet No wallet connected");
    }
  },

  async getFrameList({ state, commit }) {
    commit("updateLoading", true);

    try {
      let active_frame = [];

      if (state.connected) {

        const contract = await getContract();
        const storage = await contract.storage();
        const storage_user_frames = await storage.users.get(state.pkh);

        const user_frames = storage_user_frames.map((val) => new BigNumber(val).toNumber());
        console.log(user_frames);

        for (let index = 0; index < user_frames.length; index++) {
          const frame = await storage.frames.get({
            owner: state.pkh,
            id: user_frames[index].toString(),
          });

          const formatted_frame = { ...frame, id: new BigNumber(frame.id).toString() };

          active_frame.push(formatted_frame);
        }
      }

      commit("updateActiveFrame", active_frame);

    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        commit("updateLoading", false);
      }, 1000);
    }
  },

  async softUpdateFrameList({ state, commit }) {
    try {
      let active_frame = [];

      if (state.connected) {

        const contract = await getContract();
        const storage = await contract.storage();
        const storage_user_frames = await storage.users.get(state.pkh);

        const user_frames = storage_user_frames.map((val) => new BigNumber(val).toNumber());
        console.log(user_frames);

        for (let index = 0; index < user_frames.length; index++) {
          const frame = await storage.frames.get({
            owner: state.pkh,
            id: user_frames[index].toString(),
          });

          const formatted_frame = { ...frame, id: new BigNumber(frame.id).toString() };

          active_frame.push(formatted_frame);
        }
      }

      commit("updateActiveFrame", active_frame);

    } catch (error) {
      console.log(error);
    }
  },

  async addFrame({ dispatch }, frame) {
    try {
      const contract = await getContract();
      const op = await contract.methods.addFrame(frame).send();
      await op.confirmation();
      dispatch("softUpdateFrameList");
    } catch (error) {
      console.log(error);
    }
  },

  async deleteFrame({ dispatch }, id) {
    try {
      const contract = await getContract();
      const op = await contract.methods.deleteFrame(id).send();
      await op.confirmation();
      dispatch("softUpdateFrameList");
    } catch (error) {
      console.log(error);
    }
  },

  async updateFrame({ dispatch }, payload) {
    try {
      const contract = await getContract();
      const op = await contract.methodsObject.updateFrame(payload).send();
      await op.confirmation();
      dispatch("softUpdateFrameList");
    } catch (error) {
      console.log(error);
    }
  },
};
