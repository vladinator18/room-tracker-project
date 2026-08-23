import { supabase } from './supabaseClient';

export const votingApi = {
  // 1. Verify if an email is on the whitelist
  checkWhitelist: async (email) => {
    const { data, error } = await supabase
      .from('authorized_emails')
      .select('email')
      .eq('email', email)
      .maybeSingle(); 
      
    if (error) throw error;
    return data !== null; 
  },

  // 2. Create an event (now requires creator_email)
  createEvent: async (title, description, dates, creatorEmail) => {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{ title, description, creator_email: creatorEmail }])
      .select()
      .single();
      
    if (eventError) throw eventError;

    const dateInserts = dates.map(dateStr => ({ 
      event_id: event.id, 
      date_string: dateStr 
    }));
    
    const { error: datesError } = await supabase
      .from('date_options')
      .insert(dateInserts);
      
    if (datesError) throw datesError;

    return event.id;
  },

  // 3. Fetch event details
  getEventDetails: async (eventId) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        date_options (
          id,
          date_string,
          date_votes ( voter_email )
        )
      `)
      .eq('id', eventId)
      .single();
      
    if (error) throw error;
    return data;
  },

  // 4. Submit a vote (now requires voter_email)
  castVote: async (optionId, voterEmail) => {
    const { data, error } = await supabase
      .from('date_votes')
      .insert([{ option_id: optionId, voter_email: voterEmail }]);
      
    if (error) throw error;
    return data;
  },

  // 5. Fetch all events for the dashboard
  getAllEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};