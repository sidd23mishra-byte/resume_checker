import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          AI-Powered Resume Analyzer
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Get instant ATS score, skill gap analysis, and AI-driven suggestions
          to improve your resume and land your dream job.
        </p>

        <Link
          href="/login"
          className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-transform duration-300"
        >
          Analyze My Resume →
        </Link>
      </div>

      {/* Feature Section */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl text-center">
        
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-3">ATS Score</h3>
          <p className="text-gray-400 text-sm">
            Check how well your resume performs against ATS systems.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-3">Skill Gap Analysis</h3>
          <p className="text-gray-400 text-sm">
            Discover missing skills required for your target job role.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-semibold mb-3">AI Suggestions</h3>
          <p className="text-gray-400 text-sm">
            Get personalized improvement recommendations instantly.
          </p>
        </div>

      </div>

    </main>
  );
}