/**
 * Data Access Layer (DAL)
 * All database queries must go through this layer
 * Each query includes authentication checks using auth()
 */

export {
  getCurrentUser,
  getCurrentUserProfile,
  getUserById,
  updateCurrentUserProfile,
  exportUserData,
} from "./users";

export { getCurrentUserActivityLogs, getRecentLogins } from "./activity-logs";

export {
  getUserSubscription,
  getUserPaymentMethods,
  getUserInvoices,
  upsertSubscription,
  upsertPaymentMethod,
  createInvoice,
} from "./subscriptions";
