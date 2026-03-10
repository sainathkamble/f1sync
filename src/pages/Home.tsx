import { Navbar } from "../components/Navbar.tsx";
import { Footer } from "../components/Footer.tsx";

export const Home = () => {
    return (
        <section className="w-screen h-full">
          <Navbar />
            <div className="w-full h-full bg-black text-white flex justify-center items-center" style={{ marginBottom: "2rem" }}>
              <p>Home page WIP till then enjoy the stream :)</p>
            </div>
          <Footer />
        </section>
    );
}