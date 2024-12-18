export const routes = {
  index: '/',
  dashboard: '/dashboard',
  login: '/auth',
  logout: '/logout',
  confirmEmail: '/auth/confirm-email',

  users: "/users",
  recaps: '/recaps',
  recapDetail: '/recap/:id',

  publisherPayout: '/publisher-payout',
  publisherPayoutDetail: '/publisher-payout-detail/:id',
  publisherPayoutCreate: '/publisher-payout-create/:id',
  publisherPayoutHistory: '/publisher-payout-history/:historyId',

  contributorPayout: '/contributor-payout',
  contributorPayoutDetail: '/contributor-payout-detail/:id',
  contributorPayoutCreate: '/contributor-payout-create/:id',
  contributorPayoutHistory: '/contributor-payout-history/:historyId',

  books: '/books',
  bookDetail: '/book/:id',
  publishers: '/publishsers',
  contracts: '/contracts',
  contractCreate: '/contract/create',
  contractDetail: '/contract/:contractId',
}
