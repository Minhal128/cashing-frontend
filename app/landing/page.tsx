import Discover from "@/components/Landing/Discover";
import Faq from "@/components/Landing/Faq";
import Feature from "@/components/Landing/Feature";
import Footer from "@/components/Landing/Footer";
import HeroSection from "@/components/Landing/HeroSection";
import Tools from "@/components/Landing/Tools";
import Wallet from "@/components/Landing/Wallet";

export default function Landing() {
  return (
    <>
      <HeroSection />
      <Discover />
      <Feature />
      <Tools />
      <Faq />
      <Wallet />
      <Footer />
    </>
  );
}
