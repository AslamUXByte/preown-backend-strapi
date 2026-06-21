'use strict';

/**
 * site-user-cart controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::site-user-cart.site-user-cart',({ strapi }) => ({

    async addToCart(ctx) {

      // Logged-in user
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login.");
      }

      const { productId, quantity } = ctx.request.body;

      if (!productId || !quantity) {
        return ctx.badRequest("productId and quantity are required.");
      }

      // Check whether this product is already in the user's cart
      const existingCart = await strapi.entityService.findMany(
        'api::site-user-cart.site-user-cart',
        {
          filters: {
            users_permissions_user: user.id,
            new_product: productId,
          },
        }
      );

      // Product already exists in cart
      if (existingCart.length > 0) {

        const updatedCart = await strapi.entityService.update(
          'api::site-user-cart.site-user-cart',
          existingCart[0].id,
          {
            data: {
              quantity: existingCart[0].quantity + quantity,
            },
          }
        );

        return ctx.send({
          message: "Cart updated successfully.",
          data: updatedCart,
        });
      }

      // Product does not exist in cart
      const newCart = await strapi.entityService.create(
        'api::site-user-cart.site-user-cart',
        {
          data: {
            users_permissions_user: user.id,
            new_product: productId,
            quantity,
          },
        }
      );

      return ctx.send({
        message: "Product added to cart.",
        data: newCart,
      });
    },

    async myCart(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Please login');
      }

      const cart = await strapi.documents('api::site-user-cart.site-user-cart').findMany({
        filters: {
          users_permissions_user: user.id,
        },
        populate: {
          new_product: true,
        },
      });

      return cart;
    },

  }));
