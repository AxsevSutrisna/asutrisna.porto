const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
          © {currentYear}{" "}
          <a href="https://asutrisna.dev" className="hover:underline">
            Asep Sutrisna Suhada Putra
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
  );
};

export default Footer;