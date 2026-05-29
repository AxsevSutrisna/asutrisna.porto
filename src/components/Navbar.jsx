import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Menubar, MenubarMenu, MenubarTrigger } from "./ui/menubar";

const navItems = [
    { href: "#Hero", label: "Home" },
    { href: "#About", label: "About" },
    { href: "#WorkExperience", label: "Work Experience" },
    { href: "#Portofolio", label: "Portofolio" },
    { href: "#Contact", label: "Contact" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Hero");

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const sections = navItems.map(item => {
                const section = document.querySelector(item.href);
                if (section) {
                    return {
                        id: item.href.replace("#", ""),
                        offset: section.offsetTop - 550,
                        height: section.offsetHeight
                    };
                }
                return null;
            }).filter(Boolean);

            const currentPosition = window.scrollY;
            const active = sections.find(section =>
                currentPosition >= section.offset &&
                currentPosition < section.offset + section.height
            );

            if (active) {
                setActiveSection(active.id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            const top = section.offsetTop - 100;
            window.scrollTo({
                top: top,
                behavior: "smooth"
            });
        }
        setIsOpen(false);
    };

    const navStyle = isOpen
        ? { backgroundColor: 'var(--color-backdrop-base)' }
        : scrolled
            ? {
                backgroundColor: 'rgba(var(--color-backdrop-base-rgb), 0.88)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
            }
            : undefined;

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-500 ${!isOpen && !scrolled ? "bg-transparent" : ""
                }`}
            style={navStyle}
        >
            <div className="mx-auto px-[5%] sm:px-[5%] lg:px-[10%] pt-3">
                <div className="neo-shell flex items-center justify-between h-16 px-4 sm:px-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                    <div className="flex-shrink-0">
                        <a
                            href="#Hero"
                            onClick={(e) => scrollToSection(e, "#Hero")}
                            className="text-lg sm:text-xl font-display font-bold text-white tracking-tight"
                        >
                            asutrisnadev
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <Menubar className="ml-8 border-none bg-transparent shadow-none h-auto py-1">
                            {navItems.map((item) => (
                                <MenubarMenu key={item.label}>
                                    <MenubarTrigger
                                        asChild
                                        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${activeSection === item.href.substring(1)
                                            ? "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black data-[state=open]:bg-white data-[state=open]:text-black shadow-[4px_4px_0_var(--color-shadow-primary)]"
                                            : "text-[color:var(--color-text-secondary)] hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <a href={item.href} onClick={(e) => scrollToSection(e, item.href)}>
                                            {item.label}
                                        </a>
                                    </MenubarTrigger>
                                </MenubarMenu>
                            ))}
                        </Menubar>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            variant="ghost"
                            size="icon"
                            className={`relative transition-transform duration-300 ease-in-out transform ${isOpen ? "rotate-90 scale-105" : "rotate-0 scale-100"}`}
                        >
                            {isOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${isOpen
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                    }`}
            >
                <div className="mx-[5%] mt-3 neo-shell px-4 py-4 space-y-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                    {navItems.map((item, index) => (
                        <Button
                            key={item.label}
                            asChild
                            variant={activeSection === item.href.substring(1) ? "default" : "ghost"}
                            className={`w-full justify-start rounded-2xl px-4 py-3 text-base font-medium transition-all duration-300 ease ${activeSection === item.href.substring(1)
                                ? "neo-button-primary text-white"
                                : "text-[var(--color-text-secondary)] border-white/15"
                                }`}
                            style={{
                                transitionDelay: `${index * 100}ms`,
                                transform: isOpen ? "translateX(0)" : "translateX(50px)",
                                opacity: isOpen ? 1 : 0,
                            }}
                        >
                            <a href={item.href} onClick={(e) => scrollToSection(e, item.href)}>
                                {item.label}
                            </a>
                        </Button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;