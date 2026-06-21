module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/site-user-carts/add',
      handler: 'site-user-cart.addToCart',
      config: {
        auth: {},
      },
    },
  ],
};


module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/site-user-carts/mycart',
      handler: 'site-user-cart.myCart',
      config: {
        auth: {},
      },
    },
  ],
};