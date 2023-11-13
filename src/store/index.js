import { createStore } from "vuex";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";

export default createStore({
  state: {
    pkh: "",
    connected: false,
    loading: false,
    activeFrame: []
  },
  getters,
  mutations,
  actions,
});
