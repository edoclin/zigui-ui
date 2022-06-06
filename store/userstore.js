export const state = () => ({
  userInfo: {
    'userId': ''
  },
})
export const mutations = {
  setUserInfo(state, data) {
    state.userInfo = data
  },
}

