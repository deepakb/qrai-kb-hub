// Using more generic typing since NextAuthConfig isn't available
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    // Control access to pages
    authorized({ auth, request: { nextUrl } }: {
      auth: { user?: { id: string, email: string } } | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                        nextUrl.pathname.startsWith('/register');

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/chat', nextUrl));
      }

      // Redirect unauthenticated users from protected pages to login
      if (!isLoggedIn && !isAuthPage) {
        return false; // NextAuth will redirect to login
      }

      return true;
    },
  },
};