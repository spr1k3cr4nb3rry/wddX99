// Permission utilities for role-based access control

export const ROLES = {
  BROWSER: 'browser',      // Not logged in
  USER: 'user',            // Logged in with regular email
  EDUCATOR: 'educator',    // Logged in with .edu email
  ADMIN: 'admin'           // Admin user
}

/**
 * Get user role from auth context
 */
export const getUserRole = (user) => {
  if (!user) return ROLES.BROWSER
  return user.role || ROLES.USER
}

/**
 * Check if user can vote
 * - Browsers: NO
 * - Users, Educators, Admins: YES (once per topic)
 */
export const canVote = (user) => {
  return getUserRole(user) !== ROLES.BROWSER
}

/**
 * Check if user can comment
 * - Browsers: NO
 * - Users, Educators, Admins: YES
 */
export const canComment = (user) => {
  return getUserRole(user) !== ROLES.BROWSER
}

/**
 * Check if user can create topics/posts
 * - Browsers: NO
 * - Users: NO
 * - Educators, Admins: YES
 */
export const canCreateTopic = (user) => {
  const role = getUserRole(user)
  return role === ROLES.EDUCATOR || role === ROLES.ADMIN
}

/**
 * Check if user can approve/reject topics
 * - Only Admins: YES
 */
export const canApproveTopic = (user) => {
  return getUserRole(user) === ROLES.ADMIN
}

/**
 * Check if user can delete topics
 * - Only Admins: YES
 */
export const canDeleteTopic = (user) => {
  return getUserRole(user) === ROLES.ADMIN
}

/**
 * Check if user can see unapproved topics
 * - Only Admins: YES
 */
export const canSeeUnapproved = (user) => {
  return getUserRole(user) === ROLES.ADMIN
}

/**
 * Get permission summary for a user
 */
export const getPermissions = (user) => {
  const role = getUserRole(user)
  return {
    role,
    canVote: canVote(user),
    canComment: canComment(user),
    canCreateTopic: canCreateTopic(user),
    canApproveTopic: canApproveTopic(user),
    canDeleteTopic: canDeleteTopic(user),
    canSeeUnapproved: canSeeUnapproved(user),
  }
}

