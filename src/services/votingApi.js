import { supabase } from './supabaseClient';

export const votingApi = {
  getPolls: async () => {
    const { data, error } = await supabase.from('polls').select('*');
    if (error) throw error;
    return data;
  },
  castVote: async (pollId, optionId, userId = 'anonymous') => {
    const { data, error } = await supabase.from('votes').insert([
      { poll_id: pollId, option_id: optionId, user_id: userId }
    ]);
    if (error) throw error;
    return data;
  },
  getResults: async (pollId) => {
    const { data, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId);
    if (error) throw error;
    return data;
  }
};
