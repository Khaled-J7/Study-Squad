// frontend/src/pages/HomePage.jsx
import HeroSection from "../components/home/HeroSection";
import ForTeachersSection from "../components/home/ForTeachersSection";
import ForLearnersSection from "../components/home/ForLearnersSection";
import CommunitySection from "./../components/home/CommunitySection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ForTeachersSection />
      <ForLearnersSection />
      <CommunitySection />
    </>
  );
};

export default HomePage;
