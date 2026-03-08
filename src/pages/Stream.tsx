import { Navbar } from "../components/Navbar.tsx";
import { Footer } from "../components/Footer.tsx";

export const Stream = () => {
    return (
        <section className="w-screen h-full">
          <Navbar />
            <iframe
                className="w-full h-[90vh]"
                src="https://dlstreams.top/stream/stream-60.php"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
          <Footer />
        </section>
    );
}