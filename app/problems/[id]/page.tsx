"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Code, HardDrive, Lightbulb } from "lucide-react";

interface ProblemPageProps {
  params: { 
    id: string;
  };
}

export default function ProblemPage({ params }: ProblemPageProps) {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblem() {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('problems')
        .select(`
          *,
          solutions (*)
        `)
        .eq('id', params.id)
        .single();

      if (error || !data) {
        notFound();
      } else {
        setProblem(data);
      }
      setLoading(false);
    }

    fetchProblem();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!problem) {
    notFound();
  }

  // Parse JSON fields if they're strings
  const useCases = Array.isArray(problem.use_cases) ? problem.use_cases : 
                   typeof problem.use_cases === 'string' ? JSON.parse(problem.use_cases) : 
                   [];
                   
  const keyInsights = typeof problem.key_insights === 'object' ? problem.key_insights :
                     typeof problem.key_insights === 'string' ? JSON.parse(problem.key_insights) :
                     {};

  const approaches = Array.isArray(problem.solutions?.approaches) ? problem.solutions.approaches :
                    typeof problem.solutions?.approaches === 'string' ? JSON.parse(problem.solutions.approaches) :
                    [];

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
            {problem.title}
          </h1>
        </div>

        <Tabs defaultValue="description" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/50">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="approaches">Approaches</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <Card className="p-6 bg-black/20 border-white/10">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold text-white mb-4">Problem Description</h2>
                <p className="text-gray-300">{problem.detailed_description}</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="approaches">
            <Card className="p-6 bg-black/20 border-white/10">
              <div className="space-y-6">
                {approaches.map((approach: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {approach.title || `Approach ${index + 1}`}
                      </h3>
                    </div>
                    <p className="text-gray-300">{approach.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="discussion">
            <Card className="p-6 bg-black/20 border-white/10">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold text-white mb-4">Real-world Applications</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  {useCases.map((app: string, index: number) => (
                    <li key={index}>{app}</li>
                  ))}
                </ul>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">Key Insights</h2>
                <div className="text-gray-300">
                  {Object.entries(keyInsights).map(([key, value]: [string, any]) => (
                    <div key={key} className="mb-4">
                      <h3 className="font-semibold text-white">{key}</h3>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}