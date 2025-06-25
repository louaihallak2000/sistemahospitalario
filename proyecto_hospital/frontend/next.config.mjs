/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: true,
  swcMinify: true,

  // Configuración para desarrollo
  experimental: {
    forceSwcTransforms: true
  },

  // Optimización de imágenes
  images: {
    unoptimized: true
  },

  // Ignorar errores durante build (temporal)
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Configuración de webpack para chunks
  webpack: (config, { dev, isServer }) => {
    // Configuración específica para desarrollo
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }

    // Configuración adicional para resolver módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Configuración de headers mejorada para resolver NetworkError
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
  },

  // Configuración de proxy mejorada para resolver NetworkError
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*'
      },
      {
        source: '/auth/:path*',
        destination: 'http://127.0.0.1:8000/auth/:path*'
      },
      {
        source: '/pacientes/:path*',
        destination: 'http://127.0.0.1:8000/pacientes/:path*'
      },
      {
        source: '/episodios/:path*',
        destination: 'http://127.0.0.1:8000/episodios/:path*'
      },
      {
        source: '/admision/:path*',
        destination: 'http://127.0.0.1:8000/admision/:path*'
      },
      {
        source: '/enfermeria/:path*',
        destination: 'http://127.0.0.1:8000/enfermeria/:path*'
      }
    ]
  },

  // Configuración de redirecciones
  async redirects() {
    return []
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development'
  },

  // Configuración de output
  output: 'standalone',

  // Configuración adicional para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true
    }
  })
}

export default nextConfig
