export default {
  getSiteData: async () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      {
        path: '/search',
        component: 'src/containers/Search',
      },
      {
        path: '/sort',
        component: 'src/containers/Sort',
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
}
