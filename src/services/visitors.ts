import { supabase } from './supabase';
import { Visitor } from '../types';

export const VisitorService = {
  // Fetch active visitors (pending, accepted, waiting)
  async getActiveVisitors(): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .in('status', ['pending', 'accepted', 'waiting', 'approved', 'inside'])
      .order('arrival_time', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return [];
    }
    // Convert to application types
    return (data || []).map(parseVisitor);
  },

  // Fetch history (completed/exited/rejected visitors)
  async getHistoryVisitors(): Promise<Visitor[]> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .in('status', ['completed', 'rejected', 'exited'])
      .order('arrival_time', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }
    return (data || []).map(parseVisitor);
  },

  // Create a new visitor without a photo initially
  async createVisitor(visitorData: Partial<Visitor>): Promise<string | null> {
    const { data, error } = await supabase
      .from('visitors')
      .insert({
        temp_id: visitorData.tempId,
        name: visitorData.name,
        purpose: visitorData.purpose,
        reason: visitorData.reason,
        organisation: visitorData.origin,
        mobile: visitorData.mobile,
        origin: visitorData.origin,
        status: visitorData.status || 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating visitor:', error);
      return null;
    }
    return data.id;
  },

  // Delete a visitor (for rollback)
  async deleteVisitor(id: string): Promise<boolean> {
    const { error } = await supabase.from('visitors').delete().eq('id', id);
    if (error) {
      console.error('Error deleting visitor:', error);
      return false;
    }
    return true;
  },

  // Update photo path for a visitor
  async updateVisitorPhoto(id: string, photoPath: string): Promise<boolean> {
    const { error } = await supabase
      .from('visitors')
      .update({ photo_path: photoPath })
      .eq('id', id);

    if (error) {
      console.error('Error updating photo:', error);
      return false;
    }
    return true;
  },

  // Update visitor status
  async updateStatus(id: string | number, status: string, decidedBy?: string): Promise<boolean> {
    const updates: any = { status };
    if (decidedBy) updates.decided_by = decidedBy;
    if (status === 'completed' || status === 'rejected' || status === 'exited') {
      updates.departure_time = new Date().toISOString();
    }

    const { error } = await supabase
      .from('visitors')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      return false;
    }
    return true;
  },

  // Subscribe to real-time changes
  subscribe(onUpdate: (payload: any) => void) {
    return supabase
      .channel('public:visitors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, onUpdate)
      .subscribe();
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  },

  // Helper to get a signed URL for a private photo
  async getPhotoUrl(path: string | undefined): Promise<string | null> {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Handle seed data / external URLs
    const { data, error } = await supabase.storage.from('visitor-photos').createSignedUrl(path, 60 * 60); // 1 hour expiry
    if (error) {
      console.error('Error getting photo url:', error);
      return null;
    }
    return data.signedUrl;
  }
};

function parseVisitor(row: any): Visitor {
  return {
    // Cast UUID to string/number based on existing types. We'll use the UUID string as ID.
    // NOTE: In `types.ts`, `id` is a `number`. We should update `types.ts` to `id: string | number` or just `string`.
    id: row.id,
    tempId: row.temp_id,
    photoUrl: row.photo_path || '', // We will resolve this on render using getPhotoUrl
    name: row.name,
    purpose: row.purpose,
    reason: row.reason,
    mobile: row.mobile,
    origin: row.organisation || row.origin,
    status: row.status,
    arrivalTime: new Date(row.arrival_time),
    departureTime: row.departure_time ? new Date(row.departure_time) : undefined,
    decidedBy: row.decided_by,
  };
}
