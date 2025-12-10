'use client';

import { signIn } from 'next-auth/react';
import { Github, Lock, Shield, Database } from 'lucide-react';

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-4">
              <Github size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GitHub Payroll Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure, production-ready payroll management
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Sign in to continue
          </h2>

          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Github size={20} />
            Sign in with GitHub
          </button>

          {/* Security Features */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Why this is secure:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    OAuth 2.0 Authentication
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You never share your password with us
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Encrypted Token Storage
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    AES-256-GCM encryption for your GitHub token
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Secure Database
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Session-based authentication with encrypted storage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Permissions requested:</strong> We only request read access to your
              repositories and user information. You can revoke access anytime from your GitHub
              settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By signing in, you agree to our secure handling of your GitHub data
        </p>
      </div>
    </div>
  );
}
