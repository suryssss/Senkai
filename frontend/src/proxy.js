import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

const clerkMw = clerkMiddleware(async (auth, req) => {
  console.log("Middleware checking route:", req.url)
  if (isProtectedRoute(req)) {
    await auth().protect()
  }
})

export const proxy = clerkMw;
export default clerkMw;

export const config = {
  matcher: [

    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
