import React from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-[var(--font-display)] font-bold text-[var(--color-accent)] mb-4">
          404
        </h1>
        <p className="text-xl text-[var(--color-text)] mb-2">Page not found</p>
        <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back to discovering great content.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export function ErrorPage() {
  const error = useRouteError();
  
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-4" />
        <h1 className="text-2xl font-[var(--font-display)] font-bold text-[var(--color-text)] mb-2">
          {message}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
          We encountered an unexpected error. Please try again later.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
