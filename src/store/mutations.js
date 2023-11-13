export default {
  updatePkh(state, pkh) {
    state.pkh = pkh;
  },
  updateConnected(state, connected) {
    state.connected = connected;
  },
  updateLoading(state, loading) {
    state.loading = loading;
  },
  updateActiveFrame(state, activeFrame) {
    state.activeFrame = activeFrame;
  }
};
