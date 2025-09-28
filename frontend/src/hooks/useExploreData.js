// frontend/src/hooks/useExploreData.js
import { useState, useEffect, useCallback } from "react";
import { fetchData } from "../api/exploreService";

/*
  Minimal change hook:
  - keeps the original behavior and shape you provided
  - adds searching by tag ONLY for studios and courses
  - teachers are searched only by username (no tags)
  - no other logic changed (returns same keys and handleFilter signature)
*/

export const useExploreData = () => {
  const [allData, setAllData] = useState({
    studios: [],
    courses: [],
    teachers: [],
  });
  const [filteredData, setFilteredData] = useState({
    studios: [],
    courses: [],
    teachers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial fetch: loads studios, courses, teachers once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [studioRes, courseRes, teacherRes] = await Promise.all([
          fetchData("studio"),
          fetchData("course"),
          fetchData("teacher"),
        ]);

        const initialData = {
          studios: studioRes.data,
          courses: courseRes.data,
          teachers: teacherRes.data,
        };

        setAllData(initialData);
        setFilteredData(initialData); // show everything initially
      } catch (err) {
        console.error("Failed to fetch explore data:", err);
        setError("Sorry, we couldn't load the content.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // run once

  // Helper to check tags for a match.
  // Accepts tags either as array of strings or array of objects like {id, name}.
  const tagsContain = (tags, lowercasedSearch) => {
    if (!tags || !Array.isArray(tags)) return false;
    return tags.some((t) => {
      if (!t) return false;
      if (typeof t === "string")
        return t.toLowerCase().includes(lowercasedSearch);
      const name = (t.name || "").toString().toLowerCase();
      return name.includes(lowercasedSearch);
    });
  };

  // handleFilter: same signature you had: (searchTerm, activeFilter)
  const handleFilter = useCallback(
    (searchTerm, activeFilter) => {
      let newFilteredData = { ...allData };

      // 1) Keep your original "active filter" behavior
      if (activeFilter !== "all") {
        newFilteredData = {
          studios: activeFilter === "studios" ? allData.studios : [],
          courses: activeFilter === "courses" ? allData.courses : [],
          teachers: activeFilter === "teachers" ? allData.teachers : [],
        };
      }

      // 2) If there's a search term, filter each list.
      //    IMPORTANT: teachers are filtered ONLY by username.
      if (searchTerm) {
        const lowercasedSearch = searchTerm.toLowerCase();

        // Studios: match by name OR description OR owner username OR tags
        newFilteredData.studios = newFilteredData.studios.filter((studio) => {
          const nameMatch =
            studio.name && studio.name.toLowerCase().includes(lowercasedSearch);
          const descMatch =
            studio.description &&
            studio.description.toLowerCase().includes(lowercasedSearch);
          const ownerMatch =
            studio.owner &&
            studio.owner.username &&
            studio.owner.username.toLowerCase().includes(lowercasedSearch);
          const tagMatch = tagsContain(studio.tags, lowercasedSearch);

          return nameMatch || descMatch || ownerMatch || tagMatch;
        });

        // Courses: match by title OR description OR studio name OR tags
        newFilteredData.courses = newFilteredData.courses.filter((course) => {
          const titleMatch =
            course.title &&
            course.title.toLowerCase().includes(lowercasedSearch);
          const descMatch =
            course.description &&
            course.description.toLowerCase().includes(lowercasedSearch);
          const studioNameMatch =
            course.studio &&
            course.studio.name &&
            course.studio.name.toLowerCase().includes(lowercasedSearch);
          const tagMatch = tagsContain(course.tags, lowercasedSearch);

          return titleMatch || descMatch || studioNameMatch || tagMatch;
        });

        // Teachers: unchanged from your original — only username is used
        newFilteredData.teachers = newFilteredData.teachers.filter((teacher) =>
          teacher.username.toLowerCase().includes(lowercasedSearch)
        );
      }

      setFilteredData(newFilteredData);
    },
    [allData]
  );

  // same return shape as before
  return { ...filteredData, loading, error, handleFilter };
};
