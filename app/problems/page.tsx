"use client";

import { useState, useEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar } from "./components/search-bar";
import { DifficultyFilter } from "./components/difficulty-filter";
import { CategoryFilter } from "./components/category-filter";
import { ProblemCard } from "./components/problem-card";
import { getProblems } from "@/lib/supabase/problems";

const PROBLEMS_PER_PAGE = 6;

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      const { data, error } = await getProblems(currentPage);
      if (data && !error) {
        setProblems(data.problems || []);
        setTotalPages(Math.ceil(data.metadata.total_count / PROBLEMS_PER_PAGE));
      }
      setLoading(false);
    }

    fetchProblems();
  }, [currentPage]);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Note: Add difficulty and category filtering when those fields are added to the database
    return matchesSearch;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
          Coding Problems
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex flex-col sm:flex-row gap-4">
            <DifficultyFilter value={selectedDifficulty} onChange={setSelectedDifficulty} />
            <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredProblems.map((problem, index) => (
              <ProblemCard 
                key={problem.id} 
                problem={{
                  id: problem.id,
                  title: problem.title,
                  description: problem.summary,
                  detailedDescription: problem.detailed_description,
                  category: problem.category || [], // Add when categories are implemented
                  difficulty: problem.difficulty, // Add when difficulty is implemented
                  realWorldApplications: problem.use_cases || [],
                  supportedLanguages: problem.supported_languages || []
                }} 
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}