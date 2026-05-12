import { useState, useEffect, useCallback, memo } from "react"
import { Helmet } from "react-helmet-async"
import { Github, Linkedin, Mail, ExternalLink, Instagram, Sparkles } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from '../supabase'

const StatusBadge = memo(({ badge = 'Ready to Innovate' }) => (
  <div className="inline-block animate-float lg:mx-0" data-aos="zoom-in" data-aos-delay="400">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-3 sm:px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text sm:text-sm text-[0.7rem] font-medium flex items-center">
          <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-400" />
          {badge}
        </span>
      </div>
    </div>
  </div>
));
StatusBadge.displayName = 'StatusBadge';

const MainTitle = memo(({ title1 = 'Frontend', title2 = 'Developer' }) => (
  <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
    {/* H1: Primary heading for SEO - combines both title lines */}
    <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
      <span className="relative inline-block">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          {title1}
        </span>
      </span>
      <span className="block sm:inline-block relative mt-2 sm:mt-0 sm:ml-3">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          {title2}
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
const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/EkiZR", label: "GitHub Profile" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/ekizr/", label: "LinkedIn Profile" },
  { icon: Instagram, link: "https://www.instagram.com/ekizr_/?hl=id", label: "Instagram Profile" }
];

const HERO_FALLBACK = {
  badge_text: 'Ready to Innovate',
  title_line_1: 'Frontend',
  title_line_2: 'Developer',
  typing_words: ['Network & Telecom Student', 'Tech Enthusiast'],
  description: 'Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.',
  tech_badges: ['React', 'Javascript', 'Node.js', 'Tailwind'],
  primary_cta_label: 'Projects',
  primary_cta_url: '/#Portofolio',
  secondary_cta_label: 'Contact',
  secondary_cta_url: '/#Contact',
  hero_image_url: '/Animation1.gif',
  hero_image_alt: 'Developer illustration',
  accent_from: '#6366f1',
  accent_to: '#a855f7',
}

const Home = () => {
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [hero, setHero] = useState(HERO_FALLBACK)
  const [words, setWords] = useState(HERO_FALLBACK.typing_words)
  const [techStack, setTechStack] = useState(HERO_FALLBACK.tech_badges)

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
    const fetchHero = async () => {
      try {
        console.log('[Hero] Fetching active hero content...')
        const { data, error } = await supabase
          .from('hero_contents')
          .select('*')
          .eq('is_active', true)

        if (error) {
          console.warn('[Hero] Fetch error, using fallback:', error.message)
          setHero(HERO_FALLBACK)
          setWords(HERO_FALLBACK.typing_words)
          setTechStack(HERO_FALLBACK.tech_badges)
        } else if (data && Array.isArray(data) && data.length > 0) {
          const activeHero = data[0]
          console.log('[Hero] Fetched data:', activeHero)
          const normalized = {
            ...HERO_FALLBACK,
            ...activeHero,
            typing_words: Array.isArray(activeHero.typing_words) ? activeHero.typing_words : HERO_FALLBACK.typing_words,
            tech_badges: Array.isArray(activeHero.tech_badges) ? activeHero.tech_badges : HERO_FALLBACK.tech_badges,
          }
          console.log('[Hero] Normalized:', normalized)
          setHero(normalized)
          setWords(normalized.typing_words)
          setTechStack(normalized.tech_badges)
        } else {
          console.log('[Hero] No active hero data, using fallback')
          setHero(HERO_FALLBACK)
          setWords(HERO_FALLBACK.typing_words)
          setTechStack(HERO_FALLBACK.tech_badges)
        }
      } catch (err) {
        console.error('[Hero] Exception:', err)
        setHero(HERO_FALLBACK)
        setWords(HERO_FALLBACK.typing_words)
        setTechStack(HERO_FALLBACK.tech_badges)
      }
    }

    fetchHero()

    // Real-time subscription: listen for changes on hero_contents table
    const subscription = supabase
      .channel('public:hero_contents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_contents',
        },
        (payload) => {
          console.log('[Hero] Database change detected:', payload)
          // Re-fetch when any change occurs (INSERT, UPDATE, DELETE)
          fetchHero()
        }
      )
      .subscribe((status) => {
        console.log('[Hero] Subscription status:', status)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setIsLoaded(true);
    return () => setIsLoaded(false);
  }, []);

  const handleTyping = useCallback(() => {
    const currentWords = Array.isArray(words) && words.length > 0 ? words : HERO_FALLBACK.typing_words
    if (isTyping) {
      if (charIndex < (currentWords[wordIndex] || '').length) {
        setText(prev => prev + (currentWords[wordIndex] || '')[charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTimeout(() => setIsTyping(false), PAUSE_DURATION);
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
      } else {
        setWordIndex(prev => (prev + 1) % currentWords.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, wordIndex, words]);

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
        <title>
          {hero?.title_line_1 || 'Full-Stack'} {hero?.title_line_2 || 'Developer'} - Asep Sutrisna Suhada Putra | Web Developer Portfolio
        </title>
        <meta
          name="description"
          content={hero?.description || 'Asep Sutrisna Suhada Putra - Full-Stack Web Developer. Saya berfokus pada penciptaan pengalaman digital yang menarik dan selalu berupaya memberikan solusi terbaik dalam setiap proyek yang saya kerjakan.'}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://asutrisna.dev" />
        <meta property="og:title" content={`${hero?.title_line_1 || 'Full-Stack'} ${hero?.title_line_2 || 'Developer'} - Web Developer Portfolio`} />
        <meta property="og:description" content={hero?.description || 'Web Developer Portfolio'} />
        <meta property="og:url" content="https://asutrisna.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={hero?.hero_image_url || '/Animation1.gif'} />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Asep Sutrisna Suhada Putra",
            "jobTitle": "${hero?.title_line_1 || 'Full-Stack'} ${hero?.title_line_2 || 'Developer'}",
            "description": "${hero?.description || ''}",
            "url": "https://asutrisna.dev",
            "image": "${hero?.hero_image_url || '/Animation1.gif'}",
            "sameAs": [
              "https://github.com/EkiZR",
              "https://www.linkedin.com/in/ekizr/",
              "https://www.instagram.com/ekizr_/"
            ],
            "skills": ${JSON.stringify(hero?.tech_badges || [])}
          }
        `}</script>
      </Helmet>

      <section id="Hero" className="min-h-screen bg-[#030014] overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%]" aria-label="Hero Section">
        <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-0 sm:gap-12 lg:gap-20">
              {/* Left Column */}
              <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-left lg:text-left order-1 lg:order-1 lg:mt-0"
                data-aos="fade-right"
                data-aos-delay="200">
                <div className="space-y-4 sm:space-y-6">
                  <StatusBadge badge={hero?.badge_text} />
                  <MainTitle title1={hero?.title_line_1} title2={hero?.title_line_2} />

                  {/* Typing Effect */}
                  <div className="h-8 flex items-center" data-aos="fade-up" data-aos-delay="800">
                    <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
                      {text}
                    </span>
                    <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
                  </div>

                  {/* H2: Sub-heading + Description for SEO hierarchy */}
                  <div className="space-y-2">
                    <h2 className="sr-only">
                      {hero?.badge_text || 'Ready to Innovate'} - {hero?.description || ''}
                    </h2>
                    <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light"
                      data-aos="fade-up"
                      data-aos-delay="1000">
                      {hero?.description || HERO_FALLBACK.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="1200">
                    {Array.isArray(techStack) ? techStack.map((tech, index) => (
                      <TechStack key={index} tech={tech} />
                    )) : null}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-row gap-3 w-full justify-start" data-aos="fade-up" data-aos-delay="1400">
                    <CTAButton href={hero?.primary_cta_url || HERO_FALLBACK.primary_cta_url} text={hero?.primary_cta_label || HERO_FALLBACK.primary_cta_label} icon={ExternalLink} />
                    <CTAButton href={hero?.secondary_cta_url || HERO_FALLBACK.secondary_cta_url} text={hero?.secondary_cta_label || HERO_FALLBACK.secondary_cta_label} icon={Mail} />
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
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-3xl blur-3xl transition-all duration-700 ease-in-out ${isHovering ? "opacity-50 scale-105" : "opacity-20 scale-100"
                    }`}>
                  </div>

                  <div className={`relative lg:left-12 z-10 w-full opacity-90 transform transition-transform duration-500 ${isHovering ? "scale-105" : "scale-100"
                    }`}>
                    <img
                      src={hero?.hero_image_url || HERO_FALLBACK.hero_image_url}
                      alt={hero?.hero_image_alt || HERO_FALLBACK.hero_image_alt}
                      className={`w-full h-full object-contain transition-all duration-500 ${isHovering
                        ? "scale-[95%] sm:scale-[90%] md:scale-[90%] lg:scale-[90%] rotate-2"
                        : "scale-[90%] sm:scale-[80%] md:scale-[80%] lg:scale-[80%]"
                        }`}
                    />
                  </div>

                  <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${isHovering ? "opacity-50" : "opacity-20"
                    }`}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl animate-[pulse_6s_cubic-bezier(0.4,0,0.6,1)_infinite] transition-all duration-700 ${isHovering ? "scale-110" : "scale-100"
                      }`}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

Home.displayName = 'Home';
export default memo(Home);