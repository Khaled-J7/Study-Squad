// frontend/src/pages/ExplorePage.jsx
import { useExploreData } from "../hooks/useExploreData";
import StudioCard from "../components/explore/StudioCard";
import CourseCard from "../components/explore/CourseCard";
import TeacherCard from "../components/explore/TeacherCard";
import SkeletonCard from "../components/explore/SkeletonCard";
import FilterBar from "../components/explore/FilterBar";
import NoResults from "../components/common/NoResults";
import "./ExplorePage.css";

const ExplorePage = () => {
  // All the complex logic is now inside our custom hook
  const { studios, courses, teachers, loading, error, handleFilter } =
    useExploreData();
  // Check if there are any results to display
  const hasResults =
    studios.length > 0 || courses.length > 0 || teachers.length > 0;

  if (loading) {
    return (
      <div className="explore-page-container">
        <header className="explore-header">
          <img
            src="/StudySquadMainLogo.png"
            alt="Study Squad Logo"
            className="explore-logo"
          />
          <h2 className="explore-subtitle">
            Finding amazing content for you...
          </h2>
        </header>
        <main className="studios-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-page-container">
        <header className="explore-header">
          <img
            src="/StudySquadMainLogo.png"
            alt="Study Squad Logo"
            className="explore-logo"
          />
          <h2 className="explore-subtitle error-message">{error}</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="explore-page-container">
      <header className="explore-header">
        <img
          src="/StudySquadMainLogo.png"
          alt="Study Squad Logo"
          className="explore-logo"
        />
        <h2 className="explore-subtitle">
          Find your next learning adventure. Search for studios, courses, or
          educators.
        </h2>
      </header>

      <FilterBar onFilterChange={handleFilter} />

      {hasResults ? (
        <main className="studios-grid">
          {studios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </main>
      ) : (
        <NoResults />
      )}
    </div>
  );
};

export default ExplorePage;
