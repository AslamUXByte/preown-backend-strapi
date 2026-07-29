module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/addresses',
      handler: 'user-address.createAddress',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/addresses/my',
      handler: 'user-address.myAddresses',
      config: {
        auth: {},
      },
    },
  ],
};