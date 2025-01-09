import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

const supabase = createClientComponentClient<Database>();

export async function getProblems(page = 1) {
  try {
    const { data, error } = await supabase
      .rpc('get_problems', { page_number: page });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching problems:', error);
    return { data: null, error };
  }
}