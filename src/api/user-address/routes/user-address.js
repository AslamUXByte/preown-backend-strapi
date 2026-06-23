'use strict';

/**
 * user-address router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::user-address.user-address');


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
