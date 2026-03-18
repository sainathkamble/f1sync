import { Navbar } from "../components/Navbar.tsx";
import { Footer } from "../components/Footer.tsx";

export const Stream = () => {
    return (
        <section className="w-screen h-full">
          <Navbar />
            <iframe title="Japanese Grand Prix - Practice 1 Player" src="https://embedsports.top/embed/admin/ppv-japanese-grand-prix-practice-1/2" scrolling="no" allowFullScreen={true} allow="encrypted-media; picture-in-picture;" width="100%" height="100%"></iframe>
          <Footer />
        </section>
    );
}