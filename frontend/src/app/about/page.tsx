import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <>
      <main className="max-w-4xl mx-auto p-6 w-full flex-1 pt-12 pb-12">
        <div className="brutal-box p-8 bg-gray-100 border-dashed">
          <h2 className="text-3xl font-black uppercase mb-6 text-black border-b-4 border-black pb-2 inline-block">Our Mission</h2>
          <div className="space-y-6 font-mono text-lg">
            <p>
              DataWhisper was built with a singular goal: to bring <span className="bg-neon-green font-bold px-1 text-black">absolute mathematical certainty</span> back to AI data analysis.
            </p>
            <p>
              Large Language Models are incredible at understanding human intent, but they are notoriously terrible at arithmetic. When you ask an LLM to sum up 50,000 rows of revenue data, it hallucinates an answer that looks plausible but is fundamentally wrong.
            </p>
            <p>
              We solve this by separating the <strong>understanding</strong> from the <strong>computation</strong>. 
              DataWhisper uses AI to understand your question and write a strict data-processing plan. That plan is then executed directly on the backend using enterprise-grade Pandas processing—guaranteeing 100% numerical accuracy every single time.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
