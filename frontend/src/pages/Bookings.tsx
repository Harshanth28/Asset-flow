import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import api from '../utils/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Check,
  X,
  Plus,
  MapPin
} from 'lucide-react';

export const Bookings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Data states
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [myBookingList, setMyBookingList] = useState<any[]>([]);

  // Selection states
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Form states
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    api.get('/assets', { params: { isBookable: true } })
      .then((res) => {
        const bookableResources = res.data;
        setResources(bookableResources);
        if (bookableResources.length > 0 && !selectedResourceId) {
          setSelectedResourceId(bookableResources[0].id);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load resources.');
      });

    api.get('/bookings/my')
      .then((res) => setMyBookingList(res.data))
      .catch(() => {});
  }, []);

  // Fetch bookings for selected resource
  useEffect(() => {
    if (!selectedResourceId) return;

    api.get(`/bookings/asset/${selectedResourceId}`)
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]));
  }, [selectedResourceId]);

  // Map bookings to calendar events
  useEffect(() => {
    if (!selectedResourceId) return;

    const activeBookings = bookings.filter(
      (b: any) => b.status !== 'CANCELLED'
    );

    const mappedEvents = activeBookings.map((b: any) => {
      const isMine = user ? b.userId === user.id : false;
      return {
        id: b.id,
        title: isMine ? 'My Booking' : 'Booked',
        start: b.startTime,
        end: b.endTime,
        color: isMine ? '#00e5ff' : '#475569',
      };
    });

    setCalendarEvents(mappedEvents);
  }, [selectedResourceId, bookings, user]);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
  };

  // Time conversion helper to compare timestamps
  const timeToMinutes = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 60 + mins;
  };

  const refreshData = () => {
    if (selectedResourceId) {
      api.get(`/bookings/asset/${selectedResourceId}`)
        .then((res) => setBookings(res.data))
        .catch(() => {});
    }
    api.get('/bookings/my')
      .then((res) => setMyBookingList(res.data))
      .catch(() => {});
  };

  // Submit booking
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!bookingDate || !startTime || !endTime) {
      setError('Please select date, start time, and end time.');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (startMin >= endMin) {
      setError('End time must be after start time.');
      return;
    }

    const startDateTime = `${bookingDate}T${startTime}:00`;
    const endDateTime = `${bookingDate}T${endTime}:00`;

    api.post('/bookings', {
      assetId: selectedResourceId,
      startTime: startDateTime,
      endTime: endDateTime,
    })
      .then(() => {
        setSuccess('Booking confirmed successfully.');
        setShowAddForm(false);
        setBookingDate('');
        setStartTime('');
        setEndTime('');
        refreshData();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to create booking. The slot may already be taken.');
      });
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    clearFeedbacks();

    api.patch(`/bookings/${bookingId}/cancel`)
      .then(() => {
        setSuccess('Booking cancelled successfully.');
        refreshData();
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to cancel booking.');
      });
  };

  const selectedResource = resources.find((r: any) => r.id === selectedResourceId);
  const activeMyBookings = myBookingList.filter((b: any) => b.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resource Bookings</h1>
          <p className="text-muted-foreground text-sm">
            Book shared rooms, shuttle vehicles, and equipment with real-time overlap validation.
          </p>
        </div>

        {/* Add booking trigger */}
        <button
          onClick={() => { setShowAddForm(true); clearFeedbacks(); }}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={14} />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Selector & Calendar vs User Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Resource Selector & My Bookings list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Resource Selector */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-xs text-primary tracking-wide uppercase">Select Resource</h3>
            
            <div className="space-y-2">
              {resources.map((res: any) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedResourceId(res.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedResourceId === res.id
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-accent/15 border-border/40 text-muted-foreground hover:bg-accent/30'
                  }`}
                >
                  <h4 className="font-bold text-xs">{res.name}</h4>
                  <div className="flex items-center gap-1 text-[9px] mt-1 text-muted-foreground">
                    <MapPin size={10} />
                    <span>{res.location}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User's Reservations List */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-xs text-foreground tracking-wide uppercase">Your Reservations</h3>
            
            {activeMyBookings.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-6">No active bookings registered.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeMyBookings.map((b: any) => {
                  const res = resources.find((r: any) => r.id === b.assetId);
                  return (
                    <div key={b.id} className="p-3 rounded-lg bg-accent/15 border border-border/40 text-[10px] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-foreground truncate">{res ? res.name : 'Resource'}</h4>
                          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                            <CalendarIcon size={8} />
                            <span>{new Date(b.startTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock size={8} />
                            <span>{b.startTime.slice(11, 16)} - {b.endTime.slice(11, 16)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-[9px] text-destructive hover:underline font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: FullCalendar Widget panel */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
              {selectedResource ? `${selectedResource.name} Schedule` : 'Resource Schedule'}
            </h3>
            <span className="text-[10px] text-muted-foreground">Select week/day to verify slots</span>
          </div>

          <div className="fc-theme-dark text-xs calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
              }}
              events={calendarEvents}
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              height="auto"
              expandRows={true}
              stickyHeaderDates={true}
            />
          </div>
        </div>

      </div>

      {/* --- CREATE RESERVATION POPUP MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-border/80 bg-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">New Reservation</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              
              {/* Selected Resource info */}
              <div className="p-3 rounded-lg bg-accent/25 border border-border/40 text-xs">
                <p className="font-bold text-[10px] text-muted-foreground uppercase">Booking Resource</p>
                <p className="font-semibold text-foreground mt-0.5">{selectedResource?.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedResource?.location}</p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none text-muted-foreground"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none text-muted-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none text-muted-foreground"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-accent/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg"
                >
                  Confirm Slot
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;
