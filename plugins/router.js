// export default ({ app, store }) => {
//   app.router.beforeEach((to, from, next) => {
//     let userInfo = store.state.userstore.userInfo;
//     if (to.path.startsWith('/user')) {
//       next()
//     } else {
//       if (userInfo.userId === '') {
//         next({
//           path: '/user/login'
//         })
//       } else {
//         next()
//       }
//     }
//   })
// }
