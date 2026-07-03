import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <>
      <main className="max-w-4xl mx-auto p-6 w-full flex-1 pt-12 pb-12">
        <div className="brutal-box p-8 bg-white border-dashed">
          <div className="space-y-8 font-mono">
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-neon-green bg-black inline-block px-2 py-1">Data Privacy</h2>
              <p>Your privacy is important to us. It is DataWhisper's policy to respect your privacy regarding any information we may collect from you across our website.</p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-neon-green bg-black inline-block px-2 py-1">Data Processing</h2>
              <p>When you upload a CSV file, it is processed securely. We only retain the data for the duration of your session to answer your queries. We do not sell or share your data with third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-neon-green bg-black inline-block px-2 py-1">Information Collection</h2>
              <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
