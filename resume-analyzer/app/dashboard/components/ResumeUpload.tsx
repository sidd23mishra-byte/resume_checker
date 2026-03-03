"use client";

import { useState } from "react";

interface AnalysisResult {
  matchPercentage: number;
  suggestions: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !jobDescription.trim()) {
      setError("Resume and Job Description required");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch(
        "http://localhost:8002/api/resume/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed");
        return;
      }

      setResult(data.aiAnalysis?.data);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Resume Match Analyzer
          </h1>
          <p className="text-gray-400">
            Upload your resume and compare it with a job description using AI.
          </p>
        </div>

        {/* Upload Section */}
        <div className="border border-gray-800 rounded-xl p-8 space-y-6">

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Upload Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-700 bg-black p-3 rounded-lg"
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Paste Job Description
            </label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-gray-700 bg-black p-3 rounded-lg resize-none"
              placeholder="Paste job description here..."
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full border border-white py-3 rounded-lg hover:bg-white hover:text-black transition"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Result Section */}
        {result && (
          <div className="border border-gray-800 rounded-xl p-8 space-y-8">

            {/* Score */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Match Score</h2>
              <p className="text-5xl font-bold">
                {result.matchPercentage}%
              </p>
            </div>

            {/* Matched Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Strengths
              </h3>
              <ul className="space-y-2 text-gray-400">
                {result.matchedSkills?.map((skill, index) => (
                  <li key={index}>• {skill}</li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Missing Skills
              </h3>
              <ul className="space-y-2 text-gray-400">
                {result.missingSkills?.map((skill, index) => (
                  <li key={index}>• {skill}</li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Suggestions
              </h3>
              <ul className="space-y-2 text-gray-400">
                {result.suggestions?.map((s, index) => (
                  <li key={index}>• {s}</li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}