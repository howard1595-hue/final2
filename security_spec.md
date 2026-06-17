# Security Specification for Shutter Portfolio Manager

This document defines the data invariants, security policies, and test specification for the Firestore database of Shutter Portfolio Manager.

## 1. Data Invariants

- **User Profiles (/users/{userId})**:
  - The ID of the document must match the authenticated user's ID (`request.auth.uid`).
  - The profile must contain mandatory properties: `uid`, `name`, `email`, `createdAt`, `emailVerified`, and `authProvider`.
  - Immutable fields: `uid`, `email`, `createdAt`, `authProvider`.
  - Roles/privileges cannot be modified since standard users only have edit rights on their display name (`name`) and verification status.

- **Photography Works (/photos/{photoId})**:
  - Photos are publicly viewable by anyone, unauthenticated or authenticated.
  - Creation is only allowed for authenticated creators. The photo's `userId` must match the authenticated creator's `uid`.
  - Photo documents must contain exactly 8 properties: `title`, `description`, `category`, `location`, `shootDate`, `imageUrl`, `userId`, `createdAt`. No extra "shadow" properties allowed.
  - Update and deletion are strictly gated to the creator of the photo.
  - Immutable fields: `userId`, `createdAt`.

## 2. The "Dirty Dozen" Payloads

1. **Spoofed User Creation**: Creating a user profile document with random UID under another user's credential.
2. **Missing Profile Field**: Creating a user profile with missing `createdAt` field.
3. **Privilege Escalation in Profile**: Updating a user profile with simulated admin claims.
4. **Altering Immutable User Email**: Attempting to alter registered user email via profile update.
5. **Malicious Long String User ID**: Inundating path with highly long junk-character user IDs.
6. **Altering Immutable User ID**: Updating a profile to change the `uid` field.
7. **Malicious Long Category / Title**: Creating a photo with a category tag size of 10,000 chars.
8. **Malicious Photo Shadow Write**: Creating a photo with an unrequested field like `featured_global_rank: true`.
9. **Spoofed Photo Creation**: Unauthenticated user trying to write a photo.
10. **Hijacked Photo Deletion**: An authenticated user trying to delete a photo owned by another creator.
11. **Hijacked Photo Update**: An authenticated user trying to update a photo owned by another creator.
12. **Altering Immutable Photo Fields**: Attempting to change a photo's `createdAt` or `userId`.

## 3. The Test Runner (Spec)

Our `firestore.rules` verifies and rejects all malicious attempts above returning `PERMISSION_DENIED` under all breach instances.
