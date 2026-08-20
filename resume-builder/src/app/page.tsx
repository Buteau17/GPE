"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { UploadStep } from "@/components/UploadStep";
import { JobStep } from "@/components/JobStep";
import { ReviewStep } from "@/components/ReviewStep";
import { emptyResumeData, type ResumeData } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData());
  const [jobDescription, setJobDescription] = useState("");

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">ATS Resume Builder</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Upload your CV, point it at a job posting, and download a tailored, ATS-friendly PDF resume.
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {step === 1 ? (
            <UploadStep
              onParsed={(data) => {
                setResumeData(data);
                setStep(2);
              }}
            />
          ) : null}

          {step === 2 ? (
            <JobStep
              jobDescription={jobDescription}
              onChange={setJobDescription}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          ) : null}

          {step === 3 ? (
            <ReviewStep
              resumeData={resumeData}
              jobDescription={jobDescription}
              onBack={() => setStep(2)}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
