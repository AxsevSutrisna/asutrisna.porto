import { useState, useEffect, useCallback, memo } from "react"
import { Helmet } from "react-helmet-async"
import { Github, Linkedin, Mail, ExternalLink, Instagram, Sparkles } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from '../supabase'

const StatusBadge = memo(() => (
  <div className="inline-block animate-float lg:mx-0" data-aos="zoom-in" data-aos-delay="400">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-3 sm:px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text sm:text-sm text-[0.7rem] font-medium flex items-center">
          <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-400" />
          Ready to Innovate
        </span>
      </div>
    </div>
  </div>
));
StatusBadge.displayName = 'StatusBadge';

const MainTitle = memo(() => (
  <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
      <span className="relative inline-block">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          Frontend
        </span>
      </span>
      <br />
      <span className="relative inline-block mt-2">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          Developer
        </span>
      </span>
    </h1>
  </div>
));
MainTitle.displayName = 'MainTitle';

const TechStack = memo(({ tech }) => (
  <div className="px-4 py-2 hidden sm:block rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
    {tech}
  </div>
));
TechStack.displayName = 'TechStack';

const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="group relative w-[160px]">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur-md group-hover:opacity-90 transition-all duration-700"></div>
      <div className="relative h-11 bg-[#030014] backdrop-blur-xl rounded-lg border border-white/10 leading-none overflow-hidden">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/20 to-[#8644c5]/20"></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
          <span className="bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent font-medium z-10">
            {text}
          </span>
          <Icon className={`w-4 h-4 text-gray-200 ${text === 'Contact' ? 'group-hover:translate-x-1' : 'group-hover:rotate-45'} transform transition-all duration-300 z-10`} />
        </span>
      </div>
    </button>
  </a>
));
CTAButton.displayName = 'CTAButton';

const SocialLink = memo(({ icon: Icon, link, label }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <button className="group relative p-3"
      aria-label={label}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative rounded-xl bg-black/50 backdrop-blur-xl p-2 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  </a>
));
SocialLink.displayName = 'SocialLink';

const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 2000;
const WORDS = ["Network & Telecom Student", "Tech Enthusiast"];
const TECH_STACK = ["React", "Javascript", "Node.js", "Tailwind"];
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/EkiZR", label: "GitHub Profile" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/ekizr/", label: "LinkedIn Profile" },
  { icon: Instagram, link: "https://www.instagram.com/ekizr_/?hl=id", label: "Instagram Profile" }
];

const Home = () => {
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Hero content from database
  const [heroData, setHeroData] = useState({
    badge_text: "Ready to Innovate",
    title_line_1: "Frontend",
    title_line_2: "Developer",
    typing_words: ["Network & Telecom Student", "Tech Enthusiast"],
    description: "Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.",
    tech_badges: ["React", "Javascript", "Node.js", "Tailwind"],
    cta_buttons: [
      { label: "Projects", url: "/#Portofolio" },
      { label: "Contact", url: "/#Contact" },
    ],
    hero_image_url: "/Animation1.gif",
    accent_from: "#6366f1",
    accent_to: "#a855f7",
  })

  // Fetch hero content from database
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_contents')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          setHeroData({
            badge_text: data.badge_text || "Ready to Innovate",
            title_line_1: data.title_line_1 || "Frontend",
            title_line_2: data.title_line_2 || "Developer",
            typing_words: Array.isArray(data.typing_words) ? data.typing_words : ["Network & Telecom Student", "Tech Enthusiast"],
            description: data.description || "Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.",
            tech_badges: Array.isArray(data.tech_badges) ? data.tech_badges : ["React", "Javascript", "Node.js", "Tailwind"],
            cta_buttons: Array.isArray(data.cta_buttons) ? data.cta_buttons : [
              { label: "Projects", url: "/#Portofolio" },
              { label: "Contact", url: "/#Contact" },
            ],
            hero_image_url: data.hero_image_url || "/Animation1.gif",
            accent_from: data.accent_from || "#6366f1",
            accent_to: data.accent_to || "#a855f7",
          })
        }
      } catch (error) {
        console.error('Error fetching hero content:', error)
      }
    }

    fetchHeroContent()
  }, [])

  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: true,
        offset: 10,
      });
    };

    initAOS();
    window.addEventListener('resize', initAOS);
    return () => window.removeEventListener('resize', initAOS);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  const handleTyping = useCallback(() => {
    if (isTyping) {
      if (charIndex < heroData.typing_words[wordIndex].length) {
        setText(prev => prev + heroData.typing_words[wordIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % heroData.typing_words.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex, heroData.typing_words]);

  useEffect(() => {
    const timeout = setTimeout(
      handleTyping,
      isTyping ? TYPING_SPEED : ERASING_SPEED
    );
    return () => clearTimeout(timeout);
  }, [handleTyping]);

  return (
    <>
      <Helmet>
        <title>Asutrisnadev</title>
        <meta name="description" content="Website resmi Asutrisnadev, Full Stack Developer. Saya berfokus pada penciptaan pengalaman digital yang menarik dan selalu berupaya memberikan solusi terbaik dalam setiap proyek yang saya kerjakan." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://asutrisnadev.com" />
        <meta property="og:title" content="Asutrisnadev — Frontend Web Developer" />
        <meta property="og:description" content="Website resmi dan portofolio Asutrisnadev, Front-End Web Developer." />
        <meta property="og:url" content="https://asutrisnadev.com" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Asutrisnadev",
            "jobTitle": "Frontend Developer",
            "url": "https://asutrisnadev.com",
            "sameAs": [
              "https://github.com/EkiZR",
              "https://www.linkedin.com/in/ekizr/",
              "https://www.instagram.com/ekizr_/"
            ]
          }
        `}</script>
      </Helmet>

      <div className="min-h-screen bg-[#030014] overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%]" id="Home">
        <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-0 sm:gap-12 lg:gap-20">
              {/* Left Column */}
              <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-left lg:text-left order-1 lg:order-1 lg:mt-0"
                data-aos="fade-right"
                data-aos-delay="200">
                <div className="space-y-4 sm:space-y-6">
                  {/* Status Badge - Dynamic */}
                  <div className="inline-block animate-float lg:mx-0" data-aos="zoom-in" data-aos-delay="400">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative px-3 sm:px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
                        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text sm:text-sm text-[0.7rem] font-medium flex items-center">
                          <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-400" />
                          {heroData.badge_text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Title - Dynamic */}
                  <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
                    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                      <span className="relative inline-block">
                        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
                        <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                          {heroData.title_line_1}
                        </span>
                      </span>
                      <br />
                      <span className="relative inline-block mt-2">
                        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
                        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                          {heroData.title_line_2}
                        </span>
                      </span>
                    </h1>
                  </div>

                  {/* Typing Effect */}
                  <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
                    <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
                      {text}
                    </span>
                    <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
                  </div>

                  {/* Description */}
                  <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light"
                    data-aos="fade-up"
                    data-aos-delay="1000">
                    {heroData.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
                    {heroData.tech_badges.map((tech, index) => (
                      <TechStack key={index} tech={tech} />
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-row gap-3 w-full justify-start" data-aos="fade-up" data-aos-delay="1400">
                    {heroData.cta_buttons.slice(0, 2).map((btn, index) => (
                      <CTAButton
                        key={index}
                        href={btn.url}
                        text={btn.label}
                        icon={btn.label === 'Contact' ? Mail : ExternalLink}
                      />
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="hidden sm:flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="1600">
                    {SOCIAL_LINKS.map((social, index) => (
                      <SocialLink key={index} {...social} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - WebM Video */}
              <div className="w-full py-0 md:py-[10%] sm:py-0 lg:w-1/2 h-[260px] sm:h-[400px] lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2  mt-5 sm:mt-0"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                data-aos="fade-left"
                data-aos-delay="600">
                <div className="relative w-full opacity-90">
                  <div className={`absolute inset-0 bg-gradient-to-r from-[color:${heroData.accent_from}]/10 to-[color:${heroData.accent_to}]/10 rounded-3xl blur-3xl transition-all duration-700 ease-in-out ${isHovering ? "opacity-50 scale-105" : "opacity-20 scale-100"
                    }`} style={{ backgroundImage: `linear-gradient(to right, ${heroData.accent_from}1a, ${heroData.accent_to}1a)` }}>
                  </div>

                  <div className={`relative lg:left-12 z-10 w-full opacity-90 transform transition-transform duration-500 ${isHovering ? "scale-105" : "scale-100"
                    }`}>
                    <img
                      src={heroData.hero_image_url}
                      alt={heroData.hero_image_url || "Developer Animation"}
                      className={`w-full h-full object-contain transition-all duration-500 ${isHovering
                        ? "scale-[95%] sm:scale-[90%] md:scale-[90%] lg:scale-[90%] rotate-2"
                        : "scale-[90%] sm:scale-[80%] md:scale-[80%] lg:scale-[80%]"
                        }`}
                    />
                  </div>

                  <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${isHovering ? "opacity-50" : "opacity-20"
                    }`}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-3xl animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite] transition-all duration-700 ${isHovering ? "scale-110" : "scale-100"
                      }`} style={{ background: `linear-gradient(to bottom right, ${heroData.accent_from}19, ${heroData.accent_to}19)` }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Home.displayName = 'Home';
export default memo(Home);