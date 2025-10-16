# TODO: Add Save Post to Profile Route

## Planning Steps:

- [x] 1. Explore existing project structure
- [x] 2. Examine the favorite posts controller implementation
- [x] 3. Check existing routes and middleware
- [x] 4. Design the save post to profile functionality
- [x] 5. Create/update the controller for saving posts to profile
- [x] 6. Add the new route to the router
- [x] 7. Test the implementation
- [ ] 8. Verify pre-commit hooks are still working

## Implementation Details:

- Route: POST /api/posts/:postId/save-to-profile
- Controller: Handle saving post to user profile
- Middleware: Authentication required
- Response: Success/error message

## Design Decision:

After analyzing the existing codebase, I see we have a separate Favorite schema for favorites.
For saving posts to profile, I'll add a savedPosts array to the User schema to store post references directly.
This approach allows users to save posts to their profile separate from favorites.
