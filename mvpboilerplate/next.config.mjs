/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: [
          'localhost:3000',
          'supreme-tribble-g4qxxr946466fw4rx-3000.app.github.dev',
          // Add any other URLs you might use for development
        ],
      },
    },
  }
  
  export default nextConfig;