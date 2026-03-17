import Link from "next/link";
import Image from "next/image";

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function Footer() {
  return (
    <footer style={{ background: "#3f424a" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand + address */}
          <div>
            <Image
              src={`${WP}/Logo-steadycam.png`}
              alt="Centro Steadycam"
              width={160}
              height={50}
              className="h-10 w-auto object-contain mb-5 brightness-0 invert"
              unoptimized
            />
            <address className="not-italic text-sm space-y-1" style={{ color: "#999" }}>
              <p>C.so Michele Coppino 46/A</p>
              <p>12051 Alba (CN)</p>
              <p className="mt-2">
                <a href="tel:+390173316210" className="hover:text-white transition-colors">
                  0173 316210
                </a>
              </p>
              <p>
                <a href="mailto:info@progettosteadycam.it" className="hover:text-white transition-colors">
                  info@progettosteadycam.it
                </a>
              </p>
            </address>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-title font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "#999" }}>
              Esplora
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/blog",          label: "Blog" },
                { href: "/i-servizi",     label: "Servizi" },
                { href: "/i-progetti",    label: "Progetti" },
                { href: "/l-archivio",    label: "Archivio" },
                { href: "/display",       label: "Display" },
                { href: "/restart",       label: "Restart" },
                { href: "/adam",          label: "ADAM" },
                { href: "/staff",         label: "Staff" },
                { href: "/contatti",      label: "Contatti" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-cs-orange"
                    style={{ color: "#999" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner logos + social */}
          <div>
            <h3 className="text-xs font-title font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "#999" }}>
              Partner
            </h3>
            <div className="flex items-center gap-6 mb-8">
              <a href="http://www.aslcn2.it/" target="_blank" rel="noopener noreferrer">
                <Image
                  src={`${WP}/AslCn2.jpg`}
                  alt="ASL CN2"
                  width={80}
                  height={35}
                  className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                  unoptimized
                />
              </a>
              <Image
                src={`${WP}/Logo_ROeRO.png`}
                alt="Ro e Ro"
                width={80}
                height={35}
                className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </div>

            <h3 className="text-xs font-title font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>
              Social
            </h3>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/steadycam.centrodocaudiovisiva"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors text-sm font-bold bg-white/10 hover:bg-[#3b5998]"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://www.youtube.com/channel/UCDZjCnp9CtwBr2AoOMotlhg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-white/10 hover:bg-[#ff0000]"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={{ color: "#999" }}>
          <p>© {new Date().getFullYear()} Centro Steadycam — ASL CN2</p>
          <div className="flex gap-4">
            <a href="https://www.aslcn2.it/privacy-cookies/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="https://www.aslcn2.it/privacy-cookies/cookies/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
