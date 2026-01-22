import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import { Heart, MessageCircle, Phone, User } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[var(--store-primary)] to-[color-mix(in_srgb,var(--store-primary)_70%,black)] pt-24 pb-48 overflow-hidden">
        {/* Floating Icons Decorative Elements */}
        {/* Left - Message Bubble */}
        <div className="absolute top-24 left-[10%] animate-bounce duration-[3000ms]">
          <div className="bg-white/90 p-3 rounded-full shadow-lg transform -rotate-12 hover:scale-110 transition-transform">
            <MessageCircle
              className="w-6 h-6 text-[#3d6b6b]"
              fill="#3d6b6b"
              fillOpacity={0.1}
            />
          </div>
        </div>

        {/* Left Bottom - User Profile */}
        <div className="absolute bottom-32 left-[20%] animate-bounce duration-[4000ms] delay-700 hidden md:block">
          <div className="bg-white/90 p-4 rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white/20">
            <User className="w-8 h-8 text-[#3d6b6b]" />
          </div>
        </div>

        {/* Right Top - Heart */}
        <div className="absolute top-20 right-[15%] animate-bounce duration-[3500ms] delay-300">
          <div className="bg-white/90 p-3 rounded-full shadow-lg transform rotate-12 hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-[#3d6b6b]" fill="#3d6b6b" />
          </div>
        </div>

        {/* Right Bottom - Phone */}
        <div className="absolute bottom-40 right-[10%] animate-bounce duration-[4500ms] delay-500 hidden sm:block">
          <div className="bg-white/90 p-4 rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white/20">
            <Phone className="w-8 h-8 text-[#3d6b6b]" />
          </div>
        </div>

        {/* Background Patterns (Dots) */}
        <div className="absolute top-10 right-1/3 opacity-20">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="2" fill="white" />
            <circle cx="20" cy="2" r="2" fill="white" />
            <circle cx="20" cy="20" r="2" fill="white" />
            <circle cx="40" cy="2" r="2" fill="white" />
            <circle cx="40" cy="20" r="2" fill="white" />
            <circle cx="40" cy="40" r="2" fill="white" />
          </svg>
        </div>

        {/* Large Subtle Circles (Image Style) */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-10 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-md">
            CONTACTEZ-NOUS
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            Si vous avez des questions, n'hésitez pas à nous contacter par
            téléphone, email, via le formulaire ci-dessous ou même sur les
            réseaux sociaux !
          </p>

          <div className="mt-8 flex justify-center">
            <div className="animate-bounce text-white/80">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Wavy Bottom Divider - Matching Image Style (White Wave at Bottom) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[120px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            {/* Smooth Wavy Curve */}
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content - Overlapping the wave slightly or just below */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Form */}
          <div className="shadow-xl rounded-lg overflow-hidden bg-white">
            <ContactForm />
          </div>

          {/* Right Column: Info & Hours */}
          <div className="space-y-8 pt-8 lg:pt-0">
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
