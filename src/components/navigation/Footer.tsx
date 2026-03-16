import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">CS</span>
              </div>
              <span className="font-semibold text-lg">Centro Steadycam</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Dove la tecnologia promuove salute. Centro di educazione ai media e promozione della salute dell&apos;ASL CN2.
            </p>
            <p className="text-white/40 text-xs mt-4">
              Parte dell&apos;ASL CN2 — Cuneo
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Esplora
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/display", label: "Progetto Display" },
                { href: "/restart", label: "Progetto Restart" },
                { href: "/adam", label: "Archivio ADAM" },
                { href: "/archivio", label: "Archivio Audiovisivi" },
                { href: "/staff", label: "Il Team" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Contatti
            </h3>
            <address className="not-italic space-y-3 text-sm text-white/70">
              <p>
                <span className="block text-white/40 text-xs uppercase tracking-wide mb-1">Indirizzo</span>
                C.so Michele Coppino 46/A<br />
                12051 Alba (CN)
              </p>
              <p>
                <span className="block text-white/40 text-xs uppercase tracking-wide mb-1">Telefono</span>
                <a href="tel:+390173316210" className="hover:text-white transition-colors">
                  0173 316210
                </a>
              </p>
              <p>
                <span className="block text-white/40 text-xs uppercase tracking-wide mb-1">Email</span>
                <a href="mailto:info@progettosteadycam.it" className="hover:text-white transition-colors">
                  info@progettosteadycam.it
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Centro Steadycam — ASL CN2. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
