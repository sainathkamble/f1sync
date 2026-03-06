import { Navbar } from "../components/Navbar.tsx";
import { Footer } from "../components/Footer.tsx";

export const Home = () => {
    return (
        <section className="w-screen h-full">
          <Navbar />
          <Footer />
        </section>
    );
}