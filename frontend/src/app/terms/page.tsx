import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <>
      <main className="max-w-4xl mx-auto p-6 w-full flex-1 pt-12 pb-12">
        <div className="brutal-box p-8 bg-white">
          <div className="space-y-8 font-mono">
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 bg-black text-white inline-block px-2 py-1">1. Acceptance of Terms</h2>
              <p>By accessing and using DataWhisper, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 bg-black text-white inline-block px-2 py-1">2. Use License</h2>
              <p>Permission is granted to temporarily use the materials (information or software) on DataWhisper's website for personal, non-commercial transitory viewing only.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 bg-black text-white inline-block px-2 py-1">3. Disclaimer</h2>
              <p>The materials on DataWhisper's website are provided on an 'as is' basis. DataWhisper makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
