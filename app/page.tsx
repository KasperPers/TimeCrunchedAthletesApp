'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Time Crunched Athletes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Smart workout recommendations for busy athletes
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Connect your Strava account</strong> - We analyze your
                recent training activities
              </li>
              <li>
                <strong>Plan your week</strong> - Tell us how many sessions you
                can do and for how long
              </li>
              <li>
                <strong>Get personalized workouts</strong> - Receive optimal
                Zwift workouts based on your training data
              </li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Advanced Training Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Training Stress Score (TSS) calculation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Acute/Chronic training load monitoring</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Intensity distribution analysis</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Periodization-based recommendations</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => signIn('strava', { callbackUrl: '/dashboard' })}
              className="w-full bg-strava hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              <span>Connect with Strava</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Built for time-crunched athletes who want maximum results in minimum
            time
          </p>
        </div>
      </div>
    </main>
  );
}
