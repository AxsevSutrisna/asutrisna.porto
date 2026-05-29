import { Button } from "./ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-[5%] sm:px-[5%] lg:px-[10%] pb-6">
      <div className="neo-shell flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 sm:px-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          © {currentYear} Asep Sutrisna Suhada Putra. All Rights Reserved.
        </span>
        <Button asChild variant="neutral" size="sm" className="px-4 text-sm font-semibold">
          <a href="https://asutrisna-porto.vercel.app/" target="_blank" rel="noreferrer">
            asutrisnadev
          </a>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;