import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

import { toast } from 'sonner';
import spaceHero from '@/assets/space-hero.jpg';
interface IndustryCardProps {
	title: string;
	description: string;
	imageUrl: string;
}

function IndustryCard({ title, description, imageUrl }: IndustryCardProps) {
	return (
		<div className="flex flex-col items-center bg-[#23272f] rounded-xl p-6 shadow text-center">
			<img
				src={imageUrl}
				alt={title}
				className="rounded-lg w-20 h-20 object-cover mb-3 border-2 border-[#10b981]/30"
				loading="lazy"
			/>
			<span className="text-lg font-bold text-[#10b981] mb-1">{title}</span>
			<span className="text-xs text-[#e0e7ef]">{description}</span>
		</div>
	);
}

function App() {
	// const router = useRouter();
    const navigate = useNavigate();
	const showErrorToast = () => {
		toast.error('An error toast shows up.');
	};
	const industries: IndustryCardProps[] = [
		{
			title: "Real Estate",
			description: "Tokenize residential, commercial, and mixed-use properties for global access and liquidity.",
			imageUrl:
				"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
		},
		{
			title: "Private Credit",
			description: "Open up private credit markets to new investors and unlock yield with compliance.",
			imageUrl:
				"https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
		},
		{
			title: "Commodities",
			description: "Digitize gold, oil, and other commodities for 24/7 trading and transparency.",
			imageUrl:
				"https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=400&q=80",
		},
		{
			title: "Venture Capital",
			description: "Fractionalize VC funds and startup equity for broader participation and liquidity.",
			imageUrl:
				"https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
		},
	];

	return (
		<div className="min-h-screen bg-[#10131a] text-white  font-sans">
			<section className="relative  pt-16 pb-24 px-6 md:px-0 flex flex-col items-center">
      <img src={spaceHero} alt="space hero" className='w-full h-full object-cover absolute top-0 left-0 z-10' />
				<div className="max-w-4xl z-20 py-10 mr-auto relative h-full w-full text-center">
					<h1 className="text-2xl font-poppins text-white relative z-20 md:text-6xl font-extrabold mb-6 leading-tight">
						Tokenize the World's Real Assets with Mobius RWA
          </h1>
          <p className="text-base md:text-lg relative z-20 text-[#e0e7ef] mb-8 max-w-2xl mx-auto">
            AI Agents. Compliance. Global Access. Unlock the future of asset ownership across multiple industries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button onClick={() => navigate('/issuer/dashboard')}>Launch App</Button>
          </div>
        </div>
        <div className="absolute z-30 right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <FeaturedAssetCard />
        </div>
      </section>

      <section className="w-full bg-[#181c23] py-10 flex flex-wrap justify-center gap-6 border-b border-[#23272f]">
        {[
          { icon: '💸', title: 'Low minimum investment' },
          { icon: '📈', title: '8-16% Projected ROI' },
          { icon: '🔗', title: 'Fractional ownership' },
          { icon: '⛓️', title: 'Blockchain backed' },
          { icon: '🔄', title: 'Buy & sell tokens' },
          { icon: '🔍', title: 'Full transparency' },
        ].map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-[#23272f] rounded-xl px-6 py-4 min-w-[180px] shadow text-center"
          >
            <span className="text-3xl mb-2">{f.icon}</span>
            <span className="text-base font-semibold text-[#e0e7ef]">{f.title}</span>
          </div>
        ))}
      </section>

      <section id="industries" className="bg-[#181c23] py-20 border-t border-[#23272f]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Industries We Tokenize
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {industries.map((industry) => (
              <IndustryCard key={industry.title} {...industry} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#10131a] py-20 border-t border-[#23272f]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
          <AdvantageCard
            title="AI Agents for Asset Management"
            description="Mobius AI agents automate onboarding, compliance, and asset performance—maximizing returns and minimizing hassle."
          />
          <AdvantageCard
            title="Licensed & Regulated"
            description="Compliant with Dubai VARA and global standards. Your assets are secure and future-proof."
          />
          <AdvantageCard
            title="Seamless Ownership & Trading"
            description="Buy, sell, and manage tokens with full transparency and instant settlement."
          />
          <AdvantageCard
            title="Lower Fees, Global Access"
            description="Access global investors and pay less—just 2% DLD fees, half the industry standard."
          />
        </div>
      </section>

      <section className="bg-[#10131a] py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80" alt="Fractional ownership" className="rounded-2xl shadow-xl border-2 border-[#10b981]/20 w-full max-w-md mx-auto" />
          </div>
          <div className="flex-1 bg-[#181c23] rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-[#10b981]">What is a token?</h3>
            <p className="text-base mb-4 text-[#e0e7ef]">A token is a digital unit of ownership stored on a blockchain. For example, a property can be divided into 1,000,000 tokens, and each token represents a fraction of ownership. Buying 10,000 tokens gives you 1% ownership of the property.</p>
            <button className="mt-2 px-6 py-2 bg-gradient-to-r from-[#10b981] to-[#f59e42] text-white rounded-lg font-semibold shadow hover:scale-105 transition">Learn more</button>
          </div>
        </div>
      </section>

      <section className="bg-[#181c23] py-12 border-t border-[#23272f]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-lg font-bold text-[#10b981]">Licensed by:</span>
            <img src="/assets/vara-logo.png" alt="VARA" className="h-10 w-auto" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-lg font-bold text-[#10b981]">Strategic partnership with:</span>
            <img src="/assets/dld-logo.png" alt="Dubai Land Department" className="h-10 w-auto" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-lg font-bold text-[#10b981]">Compliant & Secure</span>
            <span className="text-xs text-[#e0e7ef]">KYC/AML, claim-based access, and smart contract security</span>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#10b981] to-[#f59e42] py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Start your tokenization journey
          </h2>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
            Let Mobius RWA's AI agents tokenize, monitor, and grow your assets—compliantly and autonomously. Start your journey today.
					</p>
					<button
						onClick={() => navigate('/issuer/dashboard')}
						className="px-10 py-4 bg-[#181c23] text-white rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition transform duration-200 border-2 border-transparent hover:border-[#10b981] focus:outline-none focus:ring-4 focus:ring-[#10b981]/40"
					>
						Get Started
					</button>
				</div>
			</section>

			<footer className="bg-[#181c23] text-white py-12">
				<div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
					<div className="flex items-center space-x-2 mb-4 md:mb-0">
						<span className="text-2xl font-extrabold tracking-widest">Mobius RWA</span>
					</div>
					<div className="text-[#e0e7ef]">&copy; {new Date().getFullYear()} Mobius RWA. All rights reserved.</div>
				</div>
			</footer>
		</div>
	);
}

function FeaturedAssetCard() {
	return (
		<div className="bg-background text-[#181c23] rounded-2xl shadow-2xl w-80 p-4 flex flex-col gap-2 border-2 border-[#10b981]/30">
			<img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Featured Asset" className="rounded-xl w-full h-32 object-cover mb-2" />
			<div className="text-xs text-[#10b981] font-bold mb-1">MBR City, Dubai</div>
			<div className="font-bold text-lg mb-1">One Bedroom Apartment in Kensington Waters by Ellington</div>
			<div className="flex gap-4 text-xs mt-2">
				<div className="bg-[#10b981]/10 px-2 py-1 rounded font-semibold">15.62% Projected ROI</div>
				<div className="bg-[#f59e42]/10 px-2 py-1 rounded font-semibold">8.06% Gross yield</div>
			</div>
		</div>
	);
}

interface AdvantageCardProps {
	title: string;
	description: string;
}

function AdvantageCard({ title, description }: AdvantageCardProps) {
	return (
		<div className="bg-[#23272f] rounded-xl p-8 shadow flex flex-col gap-2 border border-[#10b981]/20">
			<span className="text-lg font-bold text-[#10b981] mb-1">{title}</span>
			<span className="text-base text-[#e0e7ef]">{description}</span>
		</div>
	);
}

export default App;
