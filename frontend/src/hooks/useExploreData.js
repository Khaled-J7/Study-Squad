// frontend/src/hooks/useExploreData.js
import { useState, useEffect, useCallback } from "react";
import { fetchData } from "../api/exploreService";

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

  // Fetch initial data once when the hook is first used
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
        setFilteredData(initialData); // Initially, all data is shown
      } catch (err) {
        console.error("Failed to fetch explore data:", err);
        setError("Sorry, we couldn't load the content.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // The empty dependency array means this effect runs only once

  // Function to handle filtering and searching, wrapped in useCallback
  const handleFilter = useCallback(
    (searchTerm, activeFilter) => {
      let newFilteredData = { ...allData };

      // 1. Filter by the active button (studios, courses, etc.)
      if (activeFilter !== "all") {
        newFilteredData = {
          studios: activeFilter === "studios" ? allData.studios : [],
          courses: activeFilter === "courses" ? allData.courses : [],
          teachers: activeFilter === "teachers" ? allData.teachers : [],
        };
      }

      // 2. Filter by the search term
      if (searchTerm) {
        const lowercasedSearch = searchTerm.toLowerCase();

        newFilteredData.studios = newFilteredData.studios.filter((studio) =>
          studio.name.toLowerCase().includes(lowercasedSearch)
        );
        newFilteredData.courses = newFilteredData.courses.filter((course) =>
          course.title.toLowerCase().includes(lowercasedSearch)
        );
        newFilteredData.teachers = newFilteredData.teachers.filter((teacher) =>
          teacher.username.toLowerCase().includes(lowercasedSearch)
        );
      }

      setFilteredData(newFilteredData);
    },
    [allData]
  ); // This function will only be re-created if the 'allData' master list changes

  return { ...filteredData, loading, error, handleFilter };
};
