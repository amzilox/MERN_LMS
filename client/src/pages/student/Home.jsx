import Hero from "../../components/students/Hero";
import Companies from "../../components/students/Companies";
import CoursesSection from "../../components/students/CoursesSection";
import TestemonialsSection from "../../components/students/TestemonialsSection";
import CallToAction from "../../components/students/CallToAction";
import Footer from "../../components/students/Footer";

function Home() {
  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero />
      <Companies />
      <CoursesSection />
      <TestemonialsSection />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default Home;
