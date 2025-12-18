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
} from "./users";
