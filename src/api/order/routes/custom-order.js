module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/create-payment',
      handler: 'order.createPayment',
      config: { policies: [] } // Add 'global::isAuthenticated' if you want only logged-in users
    },
    {
      method: 'POST',
      path: '/orders/verify-payment',
      handler: 'order.verifyPayment',
      config: { policies: [] }
    }
  ]
}