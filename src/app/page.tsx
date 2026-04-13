import HeroScrollColor, { GlitchTitle } from "@/components/HeroScrollColor";
import HomeNavGrid, { type LatestPost } from "@/components/HomeNavGrid";
import { getBlogPosts, getBlogPost } from "@/lib/blog";

export default async function HomePage() {
  let latestPost: LatestPost | undefined;
  let smcrPost: LatestPost | undefined;
  let vincereFacilePost: LatestPost | undefined;
  try {
    const [latestRes, smcrRes, vincereRes] = await Promise.allSettled([
      getBlogPosts(1, 1),
      getBlogPost("regali-di-natale-1"),
      getBlogPost("vincere-facile-terza-edizione"),
    ]);

    if (latestRes.status === "fulfilled") {
      const post = latestRes.value.data[0];
      if (post) latestPost = {
        title: post.title,
        img:   post.featured_image_url ?? `https://centrosteadycam.it/wp-content/uploads/Steadynews03.png`,
        href:  `/blog/${post.slug}`,
      };
    }
    if (smcrRes.status === "fulfilled" && smcrRes.value) {
      const post = smcrRes.value;
      smcrPost = {
        title: post.title,
        img:   post.featured_image_url ?? `https://centrosteadycam.it/wp-content/uploads/Steadycam-SMCR.png`,
        href:  `/blog/${post.slug}`,
      };
    }
    if (vincereRes.status === "fulfilled" && vincereRes.value) {
      const post = vincereRes.value;
      vincereFacilePost = {
        title: post.title,
        img:   post.featured_image_url ?? `https://centrosteadycam.it/wp-content/uploads/MOOC_iscrizione02.png`,
        href:  `/blog/${post.slug}`,
      };
    }
  } catch {
    // Supabase non disponibile — fallback ai placeholder
  }
  return (
    <>
      {/* ── Hero ── */}
      <HeroScrollColor />

      {/* ── Mission strip ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div
            className="font-title font-bold select-none mb-4 text-left"
            style={{ fontSize: "clamp(2.5rem, 6.5vw, 6rem)", color: "#444444", lineHeight: 1 }}
          >
            <GlitchTitle />
          </div>
          <p
            className="font-title font-light text-left"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 3rem)", color: "#333", lineHeight: 1.2 }}
          >
            Costruiamo progetti e laboratori educativi dove la tecnologia promuove salute
          </p>
        </div>
      </section>

      {/* ── Nav grid ── */}
      <HomeNavGrid latestPost={latestPost} smcrPost={smcrPost} vincereFacilePost={vincereFacilePost} />
    </>
  );
}
