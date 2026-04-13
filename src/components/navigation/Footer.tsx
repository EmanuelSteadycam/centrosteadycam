import Image from "next/image";

const WP = "https://centrosteadycam.it/wp-content/uploads";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        {/* Sinistra — nome + contatti */}
        <div>
          <p className="font-semibold text-gray-900 text-base mb-1">Centro Steadycam</p>
          <address className="not-italic text-sm text-gray-500 leading-relaxed">
            <span>C.so Michele Coppino 46/A</span><br />
            <span>12051 Alba (CN) · 0173 316210</span><br />
            <a
              href="mailto:info@progettosteadycam.it"
              className="transition-colors"
              style={{ color: "#8ac893" }}
            >
              info@progettosteadycam.it
            </a>
          </address>
        </div>

        {/* Centro — policy */}
        <div className="text-sm text-center" style={{ color: "#8ac893" }}>
          <a
            href="https://www.aslcn2.it/privacy-cookies/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Policy Privacy
          </a>
          <span className="mx-2">||</span>
          <a
            href="https://www.aslcn2.it/privacy-cookies/cookies/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Cookies Policy
          </a>
        </div>

        {/* Destra — logo ASL CN2 */}
        <div>
          <a href="http://www.aslcn2.it/" target="_blank" rel="noopener noreferrer">
            <Image
              src={`${WP}/AslCn2.jpg`}
              alt="ASL CN2"
              width={130}
              height={65}
              className="h-16 w-auto object-contain"
              unoptimized
            />
          </a>
        </div>

      </div>
    </footer>
  );
}
