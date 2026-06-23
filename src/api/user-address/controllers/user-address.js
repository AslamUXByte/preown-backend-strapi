'use strict';

/**
 * user-address controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-address.user-address',
    ({ strapi }) => ({

    async createAddress(ctx) {

      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Login required");
      }

      const body = ctx.request.body;

      const address = await strapi.documents('api::user-address.user-address').create({
        data: {
          ...body,
          users_permissions_user: user.id,
        },
      });

      return address;
    },

    async myAddresses(ctx) {

      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      return await strapi.documents('api::user-address.user-address').findMany({
        filters: {
          users_permissions_user: user.id,
        },
      });

    },

  })
);
