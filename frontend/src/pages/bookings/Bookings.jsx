import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bookingsAPI } from '../../api/bookings'
import { resourcesAPI } from '../../api/resources'
import { Plus, CheckCircle, XCircle, Ban, Edit2, Trash2, QrCode, Calendar as CalendarIcon, AlertTriangle, Filter, MonitorPlay, Camera as CameraIcon, Laptop, Mic, Speaker, PlugZap, Search, FileText, Download, BarChart2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import { format, parseISO, startOfDay, addHours, endOfHour, isWithinInterval } from 'date-fns'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
const STATUS_BADGE = { 
  PENDING: 'badge-warning', 
  APPROVED: 'badge-success', 
  REJECTED: 'badge-danger', 
  CANCEL_REQUESTED: 'badge-warning', 
  CANCELLED: 'badge-gray', 
  CHECKED_IN: 'badge-purple',
  COLLECTED: 'badge-blue',
  RETURNED: 'badge-success' 
}


const GRID_COLORS = {
  AVAILABLE: '#76C8C8',
  PENDING: '#FDE68A',   // Amber for requests
  APPROVED: '#B9B4E3',  // Lavender for confirmed
  PAST: '#E2E8F0',
  MAINTENANCE: '#F97316' // Orange
}
const STATUS_TEXT = {
  PENDING: '#92400E',
  APPROVED: '#0F766E',
  REJECTED: '#B91C1C',
  CANCELLED: '#475569'
}

// Helper to ensure dates from backend are treated as UTC
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  // If the string doesn't end with Z or a timezone offset, append Z
  const utcStr = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
  return parseISO(utcStr);
};

const getEquipmentIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'projector': return <MonitorPlay size={24} color="#8b5cf6" />
    case 'camera': return <CameraIcon size={24} color="#ec4899" />
    case 'laptop': return <Laptop size={24} color="#3b82f6" />
    case 'microphone': return <Mic size={24} color="#10b981" />
    case 'speaker': return <Speaker size={24} color="#f59e0b" />
    case 'extension cord': return <PlugZap size={24} color="#64748b" />
    default: return <MonitorPlay size={24} color="#8b5cf6" />
  }
}

export default function Bookings() {
  const { user } = useAuth()
  const userRole = (user?.role || '').toUpperCase()
  const isAdmin = userRole === 'ADMIN' || userRole === 'TECHNICIAN'
  const isStudent = userRole === 'STUDENT'
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid') // 'list' | 'grid'
  const [category, setCategory] = useState(isAdmin ? 'MY_BOOKINGS' : 'ROOMS') // 'ROOMS' | 'EQUIPMENT' | 'MY_BOOKINGS'
  const [modal, setModal] = useState(null) // null | 'create' | booking obj
  const [saving, setSaving] = useState(false)
  const [cancelModal, setCancelModal] = useState(null) // ID of booking to cancel
  const [cancelReason, setCancelReason] = useState('')
  const [rejectModal, setRejectModal] = useState(null) // ID of booking to reject
  const [rejectReason, setRejectReason] = useState('')



  const getAvailableStock = (resourceId, start, end, excludeId = null) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return 0;
    const capacity = resource.capacity || 1;
    if (!start || !end) return capacity;
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    
    const overlapping = bookings.filter(b => 
      b.resourceId === resourceId && 
      b.status === 'APPROVED' && 
      b.id !== excludeId &&
      new Date(b.startTime).getTime() < endTime &&
      new Date(b.endTime).getTime() > startTime
    );
    
    const totalBooked = overlapping.reduce((sum, b) => sum + (b.quantity || 1), 0);
    return Math.max(0, capacity - totalBooked);
  };

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [selectedType, setSelectedType] = useState('All Types')
  const [equipSearch, setEquipSearch] = useState('')
  const [equipFilter, setEquipFilter] = useState('All')
  const [bookingFilter, setBookingFilter] = useState('All')
  const [bookingSearch, setBookingSearch] = useState('')
  const [form, setForm] = useState({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '', notes: '', fullName: '', contactNumber: '', email: '', fromDate: '', toDate: '', pickupTime: '', returnTime: '', quantity: 1, termsAccepted: false })
  const [errors, setErrors] = useState({})
  const [conflictWarning, setConflictWarning] = useState(null)

  const currentAvailable = useMemo(() => {
    if (category !== 'EQUIPMENT' || !form.resourceId || !form.fromDate || !form.toDate || !form.pickupTime || !form.returnTime) return null;
    const startStr = `${form.fromDate}T${form.pickupTime}:00`;
    const endStr = `${form.toDate}T${form.returnTime}:00`;
    return getAvailableStock(form.resourceId, startStr, endStr, modal?.id);
  }, [category, form.resourceId, form.fromDate, form.toDate, form.pickupTime, form.returnTime, resources, bookings, modal]);

  const load = () => Promise.all([bookingsAPI.getAll(), resourcesAPI.getAll()])
    .then(([b, r]) => { setBookings(b); setResources(r) })
    .catch(() => { }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  // Analytics Calculations
  const analyticsData = useMemo(() => {
    if (!bookings.length) return null;
    
    // 1. Bookings by Status
    const statusCounts = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(statusCounts).map(status => ({ name: status, value: statusCounts[status] }));

    // 2. Most Booked Resources
    const resourceCounts = bookings.reduce((acc, b) => {
      acc[b.resourceName] = (acc[b.resourceName] || 0) + 1;
      return acc;
    }, {});
    const barData = Object.keys(resourceCounts)
      .map(name => ({ name: name.substring(0, 10), full: name, count: resourceCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Utilization by Type
    const typeCounts = bookings.reduce((acc, b) => {
      const r = resources.find(res => res.id === b.resourceId);
      const type = r?.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const typeData = Object.keys(typeCounts).map(type => ({ name: type, count: typeCounts[type] }));

    return { pieData, barData, typeData };
  }, [bookings, resources]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  useEffect(() => {
    if (isAdmin && category === 'ROOMS') {
      setCategory('MY_BOOKINGS');
    }
  }, [isAdmin]);

  const openCreate = () => { 
    setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '', notes: '', fullName: '', contactNumber: '', email: '', quantity: '1', fromDate: format(new Date(), 'yyyy-MM-dd'), toDate: format(new Date(), 'yyyy-MM-dd'), pickupTime: '08:00', returnTime: '17:00', termsAccepted: false }); 
    setErrors({})
    setModal('select_type') 
  }
  const openEdit = b => {
    const isEquip = ['Projector', 'Camera', 'Laptop', 'Microphone', 'Speaker', 'Extension Cord'].includes(resources.find(r => r.id === b.resourceId)?.type);
    if (isEquip) {
      const notes = b.notes || '';
      const fullName = notes.match(/Name:\s*(.*)/)?.[1] || user?.name || '';
      const contactNumber = notes.match(/Contact:\s*(.*)/)?.[1] || '';
      const email = notes.match(/Email:\s*(.*)/)?.[1] || user?.email || '';
      const quantity = b.quantity || notes.match(/Qty:\s*(.*)/)?.[1] || '1';
      const termsAccepted = notes.includes('Terms Accepted: Yes');
      const cleanNotes = notes.replace(/Name:.*?\n/g, '').replace(/Contact:.*?\n/g, '').replace(/Email:.*?\n/g, '').replace(/Qty:.*?\n/g, '').replace(/Terms Accepted:.*?\n/g, '').trim();

      setForm({
        resourceId: b.resourceId,
        startTime: '', endTime: '', expectedAttendees: '',
        fromDate: format(parseDate(b.startTime), "yyyy-MM-dd"),
        toDate: format(parseDate(b.endTime), "yyyy-MM-dd"),
        pickupTime: format(parseDate(b.startTime), "HH:mm"),
        returnTime: format(parseDate(b.endTime), "HH:mm"),
        purpose: b.purpose,
        notes: cleanNotes,
        fullName, contactNumber, email, quantity, termsAccepted
      });
    } else {
      setForm({
        resourceId: b.resourceId,
        startTime: format(parseDate(b.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(parseDate(b.endTime), "yyyy-MM-dd'T'HH:mm"),
        purpose: b.purpose,
        expectedAttendees: b.expectedAttendees || '',
        notes: b.notes || ''
      });
    }
    setErrors({})
    setModal(b)
  }

  useEffect(() => {
    if (!form.resourceId || !form.startTime || !form.endTime) {
      setConflictWarning(null);
      return;
    }
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (start >= end) {
      setConflictWarning("End time must be after start time.");
      return;
    }

    // Check for overlaps with existing APPROVED bookings for the same resource
    const overlapping = bookings.filter(b => 
      b.resourceId === form.resourceId && 
      b.status === 'APPROVED' && 
      (!modal || modal === 'create' || modal.id !== b.id) &&
      (parseDate(b.startTime) < end && parseDate(b.endTime) > start)
    );

    if (overlapping.length > 0) {
      let foundSuggestion = null;
      const durationMs = end.getTime() - start.getTime();
      
      // Look forward up to 12 hours to find a gap
      for (let offset = 0; offset <= 12; offset += 0.5) {
        const potentialStart = new Date(start.getTime() + offset * 3600000);
        const potentialEnd = new Date(potentialStart.getTime() + durationMs);
        
        const isConflict = bookings.some(b => 
          b.resourceId === form.resourceId && 
          b.status === 'APPROVED' && 
          (!modal || modal === 'create' || modal.id !== b.id) &&
          (parseDate(b.startTime) < potentialEnd && parseDate(b.endTime) > potentialStart)
        );
        
        if (!isConflict) {
          foundSuggestion = { start: potentialStart, end: potentialEnd };
          break;
        }
      }

      if (foundSuggestion) {
        setConflictWarning(`This slot is booked. Next available time is ${format(foundSuggestion.start, 'HH:mm')} - ${format(foundSuggestion.end, 'HH:mm')}.`);
      } else {
        setConflictWarning("This slot is booked and no alternative times were found soon.");
      }
    } else {
      setConflictWarning(null);
    }
  }, [form.resourceId, form.startTime, form.endTime, bookings, modal]);

  const exportToICS = (b) => {
    const formatDate = (dateString) => {
      const d = parseDate(dateString);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Campus//Booking System//EN',
      'BEGIN:VEVENT',
      `UID:${b.id}@smartcampus.local`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      `DTSTART:${formatDate(b.startTime)}`,
      `DTEND:${formatDate(b.endTime)}`,
      `SUMMARY:${b.purpose} at ${b.resourceName}`,
      `DESCRIPTION:Booking for ${b.resourceName}. Notes: ${b.notes || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking_${b.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addToOutlook = (b) => {
    const start = format(parseDate(b.startTime), "yyyy-MM-dd'T'HH:mm:ss");
    const end = format(parseDate(b.endTime), "yyyy-MM-dd'T'HH:mm:ss");
    const subject = encodeURIComponent(`${b.purpose} at ${b.resourceName}`);
    const body = encodeURIComponent(`Booking for ${b.resourceName}.\nNotes: ${b.notes || ''}`);
    const location = encodeURIComponent(b.resourceName);

    const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${start}&enddt=${end}&body=${body}&location=${location}`;
    window.open(outlookUrl, '_blank');
  };

  const downloadSummaryPDF = () => {
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('Smart Campus Booking Summary', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 28);
    
    // Create Table Data with more details
    const tableRows = bookings.map(b => [
      b.resourceName,
      b.userName,
      b.userEmail || '-',
      `${format(parseDate(b.startTime), 'MMM d')} (${format(parseDate(b.startTime), 'HH:mm')} - ${format(parseDate(b.endTime), 'HH:mm')})`,
      b.status,
      b.purpose || '-',
      b.quantity || b.expectedAttendees || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Resource', 'User', 'Email', 'Time Slot', 'Status', 'Purpose', 'Qty/Att']],
      body: tableRows,
      headStyles: { fillStyle: 'f', fillColor: [59, 130, 246], fontSize: 10 }, // Blue-500
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 35 },
      styles: { fontSize: 8 }
    });

    doc.save('all-bookings-report.pdf');
    toast.success('Full Report Downloaded');
  };

  const validateForm = () => {
    const newErrors = {}
    if (category === 'EQUIPMENT') {
      if (!form.resourceId) newErrors.resourceId = 'Equipment is required'
      if (!form.fullName) newErrors.fullName = 'Full Name is required'
      if (!form.contactNumber) newErrors.contactNumber = 'Contact is required'
      else if (!/^[\d\+\-\s]+$/.test(form.contactNumber)) newErrors.contactNumber = 'Invalid contact format'
      if (!form.email) newErrors.email = 'Email is required'
      if (!form.fromDate) newErrors.fromDate = 'From Date is required'
      if (!form.toDate) newErrors.toDate = 'To Date is required'
      if (!form.pickupTime) newErrors.pickupTime = 'Pickup Time is required'
      if (!form.returnTime) newErrors.returnTime = 'Return Time is required'
      if (!form.purpose) newErrors.purpose = 'Purpose is required'
      if (!form.termsAccepted) newErrors.termsAccepted = 'Terms must be accepted'
      if (form.quantity <= 0) newErrors.quantity = 'Quantity > 0'
      
      const startStr = `${form.fromDate}T${form.pickupTime}:00`
      const endStr = `${form.toDate}T${form.returnTime}:00`
      if (new Date(endStr) <= new Date(startStr)) newErrors.returnTime = 'Must be after pickup'
    } else {
      if (!form.resourceId) newErrors.resourceId = 'Room is required'
      if (!form.startTime) newErrors.startTime = 'Start Time is required'
      if (!form.endTime) newErrors.endTime = 'End Time is required'
      if (!form.purpose) newErrors.purpose = 'Purpose is required'
      if (new Date(form.endTime) <= new Date(form.startTime)) newErrors.endTime = 'Must be after start'
      if (form.expectedAttendees && form.expectedAttendees <= 0) newErrors.expectedAttendees = 'Must be > 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return }
    let payload = { ...form }

    if (category === 'EQUIPMENT') {
      const startStr = `${form.fromDate}T${form.pickupTime}:00`
      const endStr = `${form.toDate}T${form.returnTime}:00`
      
      payload.startTime = new Date(startStr).toISOString()
      payload.endTime = new Date(endStr).toISOString()
      payload.quantity = parseInt(form.quantity || 1)
      payload.notes = `Name: ${form.fullName}\nContact: ${form.contactNumber}\nEmail: ${form.email}\nQty: ${form.quantity}\nTerms Accepted: Yes\n\n${form.notes || ''}`
    } else {
      payload.startTime = new Date(form.startTime).toISOString()
      payload.endTime = new Date(form.endTime).toISOString()
    }

    setSaving(true)
    try {
      if (payload.expectedAttendees) payload.expectedAttendees = parseInt(payload.expectedAttendees)
      if (modal === 'create') { await bookingsAPI.create(payload); toast.success(category === 'EQUIPMENT' ? 'Equipment booking submitted!' : 'Booking requested!') }
      else { await bookingsAPI.update(modal.id, payload); toast.success('Booking updated!') }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save booking')
    } finally { setSaving(false) }
  }

  const seedDatabase = async () => {
    const newResources = [
      { name: "A101", type: "Lecture Hall", location: "1st Floor", capacity: 100 },
      { name: "A102", type: "Lecture Hall", location: "1st Floor", capacity: 100 },
      { name: "A201", type: "Lecture Hall", location: "2nd Floor", capacity: 80 },
      { name: "A202", type: "Lecture Hall", location: "2nd Floor", capacity: 80 },
      { name: "A203", type: "Lecture Hall", location: "2nd Floor", capacity: 80 },
      { name: "A204", type: "Lecture Hall", location: "2nd Floor", capacity: 80 },
      { name: "A301", type: "Lecture Hall", location: "3rd Floor", capacity: 80 },
      { name: "A302", type: "Lecture Hall", location: "3rd Floor", capacity: 80 },
      { name: "A303", type: "Lecture Hall", location: "3rd Floor", capacity: 80 },
      { name: "A304", type: "Lecture Hall", location: "3rd Floor", capacity: 80 },
      { name: "A401", type: "Laboratory", location: "4th Floor", capacity: 40 },
      { name: "A402", type: "Laboratory", location: "4th Floor", capacity: 40 },
      { name: "A403", type: "Laboratory", location: "4th Floor", capacity: 40 },
      { name: "A404", type: "Laboratory", location: "4th Floor", capacity: 40 },
      { name: "A405", type: "Lecture Hall", location: "4th Floor", capacity: 60 },
      { name: "A501", type: "Lecture Hall", location: "5th Floor", capacity: 60 },
      { name: "A502", type: "Lecture Hall", location: "5th Floor", capacity: 60 },
      { name: "A503", type: "Lecture Hall", location: "5th Floor", capacity: 60 },
      { name: "A504", type: "Lecture Hall", location: "5th Floor", capacity: 60 },
      { name: "A601", type: "Lecture Hall", location: "6th Floor", capacity: 150 },
      { name: "A602", type: "Lecture Hall", location: "6th Floor", capacity: 150 }
    ];

    try {
      toast.loading('Seeding database with rooms...', { id: 'seed' });
      for (const r of newResources) {
        await resourcesAPI.create(r);
      }
      toast.success('Database seeded successfully!', { id: 'seed' });
      load();
    } catch (err) {
      toast.error('Failed to seed database: ' + (err.response?.data?.message || err.message), { id: 'seed' });
    }
  };

  const handleApprove = async (id) => { await bookingsAPI.approve(id); toast.success('Booking approved'); load() }
  const handleReject = async (id) => { 
    setRejectModal(id);
    setRejectReason('');
  }
  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setSaving(true);
      await bookingsAPI.reject(rejectModal, rejectReason);
      toast.success('Booking rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error('Failed to reject booking');
    } finally {
      setSaving(false);
    }
  }
  const handleCancel = async (id, reason) => { 
    await bookingsAPI.cancel(id, reason); 
    toast.success(`Request sent with reason: "${reason}"`); 
    load() 
  }
  const handleAcceptCancel = async (id) => { await bookingsAPI.acceptCancel(id); toast.success('Cancellation approved'); load() }
  const handleRejectCancel = async (id) => { await bookingsAPI.rejectCancel(id); toast.success('Cancellation rejected'); load() }
  const handleCheckIn = async (id) => { 
    try { 
      await bookingsAPI.checkIn(id); toast.success('Check-in successful!'); load() 
    } catch (err) { 
      toast.error(err.response?.data?.message || err.message || 'Check-in failed') 
    } 
  }
  const handleDelete = async (id) => {
    if (isAdmin) {
      if (!window.confirm('Delete this booking permanently?')) return
      try {
        await bookingsAPI.delete(id); toast.success('Booking deleted'); load()
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete booking')
      }
    } else {
      setCancelModal(id);
      setCancelReason('');
    }
  }

  const submitCancellation = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a reason for cancellation");
      return;
    }
    try {
      setSaving(true);
      await handleCancel(cancelModal, cancelReason);
      setCancelModal(null);
      setCancelReason('');
    } catch (err) {
      toast.error('Failed to submit cancellation request');
    } finally {
      setSaving(false);
    }
  }


  const handleCollect = async (id) => { 
    try { 
      await bookingsAPI.collect(id); toast.success('Equipment marked as Collected'); load() 
    } catch (err) { 
      toast.error('Failed to update status') 
    } 
  }
  const handleReturn = async (id) => { 
    try { 
      await bookingsAPI.returnEquipment(id); toast.success('Equipment marked as Returned'); load() 
    } catch (err) { 
      toast.error('Failed to update status') 
    } 
  }

  // Recommendation Logic for UI
  const selectedResource = resources.find(r => r.id === form.resourceId);
  const isOverCapacity = selectedResource && form.expectedAttendees && parseInt(form.expectedAttendees) > selectedResource.capacity;
  const recommendedRooms = useMemo(() => {
    if (!form.expectedAttendees || isNaN(form.expectedAttendees)) return [];
    const count = parseInt(form.expectedAttendees);
    return resources
      .filter(r => !['Projector', 'Camera', 'Laptop', 'Microphone', 'Speaker', 'Extension Cord'].includes(r.type))
      .filter(r => r.capacity >= count && r.id !== form.resourceId)
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 3);
  }, [form.expectedAttendees, resources, form.resourceId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Booking System</h1><p className="page-subtitle">Manage resource reservations and approvals.</p></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {!isAdmin ? (
              <>
                <button className={`tab ${category === 'ROOMS' ? 'active' : ''}`} onClick={() => { setCategory('ROOMS'); setSelectedLocation('All'); setSelectedType('All Types'); }}>Halls & Labs</button>
                <button className={`tab ${category === 'EQUIPMENT' ? 'active' : ''}`} onClick={() => { setCategory('EQUIPMENT'); setSelectedLocation('All'); setSelectedType('All Types'); }}>Equipment</button>
                <button className={`tab ${category === 'MY_BOOKINGS' ? 'active' : ''}`} onClick={() => { setCategory('MY_BOOKINGS'); }}>My Bookings</button>
              </>
            ) : (
              <>
                <button className={`tab ${category === 'MY_BOOKINGS' ? 'active' : ''}`} onClick={() => { setCategory('MY_BOOKINGS'); }}>Dashboard</button>
                <button className={`tab ${category === 'ANALYTICS' ? 'active' : ''}`} onClick={() => { setCategory('ANALYTICS'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart2 size={14} /> Analytics</button>
              </>
            )}
          </div>
          {(isStudent || isAdmin) && category !== 'ANALYTICS' && (
            <button onClick={openCreate} className="btn btn-primary"><Plus size={16} />New Booking</button>
          )}
        </div>
      </div>

      {category !== 'MY_BOOKINGS' && (
        <div className="animate-fade-in" style={{
          background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
          padding: '24px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          fontFamily: '"Inter", sans-serif'
        }}>
          {/* Header Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                {category === 'ROOMS' ? 'Room Availability' : 'Equipment Booking'}
              </h1>
              <p style={{ margin: '6px 0 0', color: '#8a99af', fontSize: '14px', fontWeight: '500' }}>
                {category === 'ROOMS' ? 'Book a lecture hall or laboratory slot in real-time.' : 'Request and reserve university equipment by the hour.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {category === 'ROOMS' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff' }}>
                  <CalendarIcon size={18} color="#3b82f6" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '600', fontSize: '14px', background: 'transparent' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff' }}>
                <Filter size={18} color="#94a3b8" />
                <select 
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer', paddingRight: '10px' }}
                >
                  {category === 'ROOMS' ? (
                    <>
                      <option value="All">All Floors</option>
                      {[...new Set(resources.filter(r => r.type !== 'EQUIPMENT').map(r => r.location))].sort().map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="All">All Locations</option>
                      {[...new Set(resources.filter(r => r.type === 'EQUIPMENT').map(r => r.location))].sort().map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff' }}>
                <Filter size={18} color="#94a3b8" />
                <select 
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer', paddingRight: '10px' }}
                >
                  <option value="All Types">All Types</option>
                  {category === 'ROOMS' ? (
                    <>
                      {[...new Set(resources.filter(r => r.type !== 'EQUIPMENT').map(r => r.type))].sort().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </>
                  ) : (
                    <>
                      {[...new Set(resources.filter(r => r.type === 'EQUIPMENT').map(r => r.name))].sort().map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Card For Rooms */}
          {category === 'ROOMS' && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
              <div style={{ minWidth: '800px' }}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '36px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ width: '18px', height: '18px', background: '#3b82f6', borderRadius: '4px' }} /> Available
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ width: '18px', height: '18px', background: GRID_COLORS.PENDING, borderRadius: '4px' }} /> Pending Request
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ width: '18px', height: '18px', background: '#f1f5f9', borderRadius: '4px' }} /> Booked
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ width: '18px', height: '18px', background: GRID_COLORS.MAINTENANCE, borderRadius: '4px' }} /> Maintenance
                  </div>
                </div>

                <div style={{ display: 'flex', marginLeft: '140px', marginBottom: '20px' }}>
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => (
                    <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {resources.filter(r => {
                    const isEquip = ['Projector', 'Camera', 'Laptop', 'Microphone', 'Speaker', 'Extension Cord'].includes(r.type);
                    if (isEquip) return false;
                    if (selectedType !== 'All Types' && r.type !== selectedType && r.type !== selectedType.toUpperCase()) return false;
                    if (selectedLocation !== 'All' && r.location !== selectedLocation) return false;
                    return true;
                  }).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '20px' }}>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>{r.name}</div>
                        <div style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', width: 'fit-content', textTransform: 'capitalize' }}>
                          {r.type.toLowerCase().replace('_', ' ')}
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                        {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => {
                          const day = parseISO(selectedDate)
                          const slotStart = addHours(startOfDay(day), h)
                          const slotEnd = endOfHour(slotStart)
                          
                          const now = new Date()
                          const isPast = slotEnd < now
                          const isMaintenance = r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE'

                          const booking = bookings.find(b => {
                            if (!['PENDING', 'APPROVED'].includes(b.status)) return false
                            if (b.resourceId !== r.id) return false
                            const bStart = parseDate(b.startTime)
                            const bEnd = parseDate(b.endTime)
                            return isWithinInterval(slotStart, { start: bStart, end: bEnd }) ||
                              isWithinInterval(slotEnd, { start: bStart, end: bEnd }) ||
                              (bStart <= slotStart && bEnd >= slotEnd)
                          })

                          let bgColor = '#3b82f6'; // Default Available
                          if (isPast) bgColor = GRID_COLORS.PAST;
                          if (isMaintenance) bgColor = GRID_COLORS.MAINTENANCE;
                          if (booking) {
                            bgColor = booking.status === 'PENDING' ? GRID_COLORS.PENDING : '#f1f5f9';
                          }

                          const isAvailable = !isPast && !booking && !isMaintenance;

                          let title = `Available at ${h}:00`
                          if (isPast) title = 'Past Time'
                          if (booking) title = (isAdmin || booking.userId === user?.id) ? `${booking.status}: ${booking.purpose} (${booking.userName})` : 'Occupied'
                          if (isMaintenance) title = 'Under Maintenance'

                          return (
                            <div
                              key={h}
                              title={title}
                              onClick={() => {
                                if (booking && isAdmin && booking.status === 'PENDING') {
                                  if (window.confirm(`Approve booking for "${booking.purpose}" by ${booking.userName}?\n\nClick OK to Approve, Cancel to Reject.`)) {
                                    handleApprove(booking.id);
                                  } else {
                                    handleReject(booking.id);
                                  }
                                  return
                                }
                                if (isAvailable) {
                                  setForm({
                                    resourceId: r.id,
                                    startTime: `${selectedDate}T${String(h).padStart(2, '0')}:00`,
                                    endTime: `${selectedDate}T${String(h + 1).padStart(2, '0')}:00`,
                                    purpose: '', notes: ''
                                  })
                                  setModal('create')
                                } else {
                                  if(!booking || (!isAdmin && booking.userId !== user?.id)) {
                                    toast.error(isPast ? 'This slot has already passed.' : 'This slot is not available.');
                                  }
                                }
                              }}
                              style={{
                                flex: 1, height: '46px', background: bgColor, borderRadius: '6px',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                transition: 'opacity 0.2s, transform 0.1s',
                              }}
                              onMouseEnter={e => { if(isAvailable) { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(1.03)'; } }}
                              onMouseLeave={e => { if(isAvailable) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; } }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cards Grid For Equipment */}
          {category === 'EQUIPMENT' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff', flex: 1, minWidth: '200px' }}>
                  <Search size={18} color="#94a3b8" />
                  <input 
                    placeholder="Search equipment by name..." 
                    value={equipSearch}
                    onChange={e => setEquipSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', color: '#475569', fontSize: '14px', background: 'transparent' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff' }}>
                  <Filter size={18} color="#94a3b8" />
                  <select 
                    value={equipFilter}
                    onChange={e => setEquipFilter(e.target.value)}
                    style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer' }}
                  >
                    <option value="All">All Status</option>
                    <option value="Available">Available Now</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              {(() => {
                const filteredEquip = resources.filter(r => {
                  const isEquip = r.type === 'EQUIPMENT';
                  if (!isEquip) return false;
                  if (selectedType !== 'All Types' && r.name !== selectedType) return false;
                  if (selectedLocation !== 'All' && r.location !== selectedLocation) return false;
                  if (equipSearch && !r.name.toLowerCase().includes(equipSearch.toLowerCase())) return false;
                  
                  const now = new Date();
                  const isCurrentlyBooked = bookings.some(b => 
                    b.resourceId === r.id && 
                    b.status === 'APPROVED' && 
                    parseDate(b.startTime) <= now && 
                    parseDate(b.endTime) >= now
                  );
                  const isAvailableNow = !isCurrentlyBooked && r.status !== 'OUT_OF_SERVICE' && r.status !== 'MAINTENANCE';
                  
                  if (equipFilter === 'Available' && !isAvailableNow) return false;
                  if (equipFilter === 'Not Available' && isAvailableNow) return false;
                  
                  return true;
                });

                if (filteredEquip.length === 0) {
                  return (
                    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '60px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                      <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>No equipment available matching your criteria.</div>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filteredEquip.map(r => {
                      const now = new Date();
                      const isCurrentlyBooked = bookings.some(b => 
                        b.resourceId === r.id && 
                        b.status === 'APPROVED' && 
                        parseDate(b.startTime) <= now && 
                        parseDate(b.endTime) >= now
                      );
                      const isAvailableNow = !isCurrentlyBooked && r.status !== 'OUT_OF_SERVICE' && r.status !== 'MAINTENANCE';

                      return (
                        <div key={r.id} style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              {r.images && r.images.length > 0 ? (
                                <img src={r.images[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                getEquipmentIcon(r.type)
                              )}
                            </div>
                            <div style={{ background: isAvailableNow ? '#dcfce7' : '#fee2e2', color: isAvailableNow ? '#16a34a' : '#dc2626', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px' }}>
                              {isAvailableNow ? 'Available' : 'Not Available'}
                            </div>
                          </div>
                          
                          <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>{r.name}</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{r.type} • {r.location}</p>
                          </div>

                          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                              Qty: <span style={{ color: '#1e293b', fontWeight: '700' }}>{isAvailableNow ? r.capacity : 0}</span> / {r.capacity}
                            </div>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => {
                                setForm({ resourceId: r.id, startTime: '', endTime: '', purpose: '', notes: '', quantity: '1', fromDate: format(new Date(), 'yyyy-MM-dd'), toDate: format(new Date(), 'yyyy-MM-dd'), pickupTime: '08:00', returnTime: '17:00', termsAccepted: false, fullName: '', contactNumber: '', email: '' })
                                setModal('create')
                              }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {category === 'MY_BOOKINGS' && (
        <div className="animate-fade-in">
          {/* Header Card for My Bookings */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{isAdmin ? 'All Bookings' : 'My Bookings'}</h1>
              <p style={{ margin: '6px 0 0', color: '#8a99af', fontSize: '14px', fontWeight: '500' }}>Manage {isAdmin ? 'all' : 'your'} lecture hall, lab, and equipment reservations.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff', minWidth: '200px' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  placeholder="Search by name or ID..." 
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', color: '#475569', fontSize: '14px', background: 'transparent' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', background: '#ffffff' }}>
                <Filter size={18} color="#94a3b8" />
                <select 
                  value={bookingFilter}
                  onChange={e => setBookingFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '600', fontSize: '14px', background: 'transparent', cursor: 'pointer' }}
                >
                  <option value="All">All Bookings</option>
                  <option value="Halls">Lecture Halls</option>
                  <option value="Labs">Laboratories</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
              {isAdmin && (
                <button onClick={() => downloadSummaryPDF()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', borderColor: '#10B981', color: '#fff' }}>
                  <Download size={18} /> Download All Bookings Report
                </button>
              )}
            </div>
          </div>

          <div className="table-wrapper card" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            {(() => {
              const isEquip = (t) => ['Projector', 'Camera', 'Laptop', 'Microphone', 'Speaker', 'Extension Cord'].includes(t);
              const isLab = (t) => t?.toLowerCase().includes('lab');
              
              const userBookings = isAdmin ? bookings : bookings.filter(b => b.userId === user?.id);
              const displayBookings = userBookings.filter(b => {
                const r = resources.find(res => res.id === b.resourceId);
                if (!r) return true;
                
                if (bookingFilter === 'Equipment' && !isEquip(r.type)) return false;
                if (bookingFilter === 'Halls' && (isEquip(r.type) || isLab(r.type))) return false;
                if (bookingFilter === 'Labs' && (!isLab(r.type) || isEquip(r.type))) return false;
                
                if (bookingSearch) {
                  const s = bookingSearch.toLowerCase();
                  if (!b.id.toLowerCase().includes(s) && !(r?.name || '').toLowerCase().includes(s) && !b.purpose.toLowerCase().includes(s)) return false;
                }
                
                return true;
              }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

              return (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {isAdmin ? (
                        <>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Resource</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Requested By</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Attendees</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Start</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>End</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Purpose</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                        </>
                      ) : (
                        <>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>ID</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Resource Name</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Date / Time Slot</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Purpose</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>No bookings found matching your criteria.</td></tr>
                    ) : displayBookings.map(b => {
                      const r = resources.find(res => res.id === b.resourceId);
                      const type = !r ? 'Unknown' : isEquip(r.type) ? 'Equipment' : isLab(r.type) ? 'Lab' : 'Hall';
                      const isEquipType = type === 'Equipment';
                      
                      let qtyStr = b.quantity || '-';
                      if (isEquipType && !b.quantity && b.notes) {
                         const match = b.notes.match(/Qty:\s*(\d+)/);
                         if (match) qtyStr = match[1];
                      }

                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {isAdmin ? (
                            <>
                              <td style={{ padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>{r?.type || b.resourceName}</td>
                              <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{r?.location || '-'}</td>
                              <td style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>{b.userName}</td>
                              <td style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>{isEquipType ? `Qty: ${qtyStr}` : (b.expectedAttendees || '-')}</td>
                              <td style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>{format(parseDate(b.startTime), 'MMM d, HH:mm')}</td>
                              <td style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>{format(parseDate(b.endTime), 'MMM d, HH:mm')}</td>
                              <td style={{ padding: '16px', maxWidth: 180 }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#475569' }}>{b.purpose}</div>
                                {b.status === 'REJECTED' && b.rejectionReason && (
                                                                    <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertTriangle size={12} />
                                    <span><strong>Reason:</strong> {b.rejectionReason}</span>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '16px' }}><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  {b.status === 'CANCEL_REQUESTED' ? (
                                    <>
                                      <button onClick={() => handleAcceptCancel(b.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={14} /> Accept Cancel</button>
                                      <button onClick={() => handleRejectCancel(b.id)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Keep Booking</button>
                                    </>
                                  ) : b.status === 'PENDING' ? (
                                    <>
                                      <button onClick={() => handleApprove(b.id)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10B981', borderColor: '#10B981', color: '#fff' }}><CheckCircle size={14} /> Approve</button>
                                      <button onClick={() => handleReject(b.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> Reject</button>
                                    </>
                                  ) : (
                                    <>
                                      {b.status === 'APPROVED' && (
                                      <>
                                        <button onClick={() => handleCheckIn(b.id)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#8B5CF6', color: '#8B5CF6' }}>
                                          <QrCode size={14} /> Simulate QR Check-in
                                        </button>
                                        {isEquipType && (
                                          <button onClick={() => handleCollect(b.id)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#3B82F6', color: '#3B82F6' }}>
                                            <Download size={14} /> Mark Collected
                                          </button>
                                        )}
                                      </>
                                    )}
                                    {b.status === 'COLLECTED' && isEquipType && (
                                      <button onClick={() => handleReturn(b.id)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#10B981', color: '#10B981' }}>
                                        <CheckCircle size={14} /> Mark Returned
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                                {(b.status === 'CANCELLED' || b.status === 'CANCEL_REQUESTED') && (
                                  <div style={{ fontSize: '11px', color: '#475569', marginTop: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Ban size={12} />
                                    <span><strong>Student Reason:</strong> {b.cancellationReason || 'No reason provided'}</span>
                                  </div>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontFamily: 'monospace' }}>#{b.id.substring(0, 8)}</td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: type === 'Equipment' ? '#f3e8ff' : type === 'Lab' ? '#ccfbf1' : '#e0f2fe', color: type === 'Equipment' ? '#9333ea' : type === 'Lab' ? '#0f766e' : '#0369a1' }}>
                                  {type}
                                </div>
                              </td>
                              <td style={{ padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>{r?.name || b.resourceName}</td>
                              <td style={{ padding: '16px' }}>
                                {isEquipType ? (
                                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> {format(parseDate(b.startTime), 'MMM d, HH:mm')}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }}></div> {format(parseDate(b.endTime), 'MMM d, HH:mm')}</div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '13px', color: '#475569' }}>
                                    <div style={{ fontWeight: '500' }}>{format(parseDate(b.startTime), 'MMM d, yyyy')}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{format(parseDate(b.startTime), 'HH:mm')} - {format(parseDate(b.endTime), 'HH:mm')}</div>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '16px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>{qtyStr}</td>
                              <td style={{ padding: '16px', maxWidth: 180 }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#475569' }}>{b.purpose}</div>
                                {b.status === 'REJECTED' && b.rejectionReason && (
                                                                    <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertTriangle size={12} />
                                    <span><strong>Reason:</strong> {b.rejectionReason}</span>
                                  </div>
                                )}
                                {b.status === 'CANCELLED' && b.cancellationReason && (
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>Cancelled: {b.cancellationReason}</div>
                                )}
                              </td>
                              <td style={{ padding: '16px' }}><span className={`badge ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => { setCategory(isEquipType ? 'EQUIPMENT' : 'ROOMS'); openEdit(b); }} className="btn btn-primary btn-sm" disabled={b.status !== 'PENDING'} style={Object.assign({ padding: '6px', background: '#3b82f6', borderColor: '#3b82f6', color: '#fff' }, (b.status !== 'PENDING') ? { opacity: 0.5, cursor: 'not-allowed' } : {})} title="Edit">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(b.id)} className="btn btn-danger btn-sm" disabled={!['PENDING', 'APPROVED'].includes(b.status)} style={Object.assign({ padding: '6px' }, (!['PENDING', 'APPROVED'].includes(b.status)) ? { opacity: 0.5, cursor: 'not-allowed' } : {})} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                  {b.status === 'APPROVED' && (
                                    <button onClick={() => addToOutlook(b)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: '#3B82F6', color: '#3B82F6', padding: '6px 12px' }} title="Sync to Calendar">
                                      <CalendarIcon size={14} /> Add to Calendar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* Create/Edit Booking Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: modal === 'select_type' ? '540px' : '820px', transition: 'max-width 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modal === 'select_type' ? 'Select Booking Type' : 
                 modal === 'create' ? 'New Booking Request' :
                 (isAdmin && modal.status === 'PENDING' ? 'Manage Booking Request' : 'Booking Details')}
              </h3>
              <button onClick={() => setModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modal === 'select_type' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '20px 0' }}>
                  <div 
                    onClick={() => { setCategory('ROOMS'); setModal('create'); }}
                    style={{ cursor: 'pointer', padding: 24, borderRadius: 16, border: '2px solid #e2e8f0', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f0f7ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <AlertTriangle size={30} />
                    </div>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Halls & Labs</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Book a lecture hall or computer laboratory</p>
                  </div>
                  <div 
                    onClick={() => { setCategory('EQUIPMENT'); setModal('create'); }}
                    style={{ cursor: 'pointer', padding: 24, borderRadius: 16, border: '2px solid #e2e8f0', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = '#f5f3ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <MonitorPlay size={30} />
                    </div>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Equipment</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Request projectors, cameras, laptops, etc.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Show Status Badge in Modal */}
              {modal !== 'create' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${STATUS_BADGE[modal.status]}`}>{modal.status}</span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Requested by: <strong>{modal.userName}</strong></span>
                </div>
              )}
              {modal !== 'create' && modal.status === 'REJECTED' && modal.rejectionReason && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                  <strong>Rejection Reason:</strong> {modal.rejectionReason}
                </div>
              )}
              {conflictWarning && (
                <div className="animate-fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <AlertTriangle size={16} />
                  <span>{conflictWarning}</span>
                </div>
              )}

              {category === 'EQUIPMENT' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Full Name *</label>
                      <input className={`form-input ${errors.fullName ? 'error' : ''}`} placeholder="e.g. Kasun Perera" value={form.fullName} onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); if(errors.fullName) setErrors(err=>({...err, fullName:null})) }} />
                      {errors.fullName && <div className="form-error-msg">{errors.fullName}</div>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Contact Number *</label>
                      <input className={`form-input ${errors.contactNumber ? 'error' : ''}`} placeholder="e.g. 071-234-5678" value={form.contactNumber} onChange={e => { setForm(f => ({ ...f, contactNumber: e.target.value })); if(errors.contactNumber) setErrors(err=>({...err, contactNumber:null})) }} />
                      {errors.contactNumber && <div className="form-error-msg">{errors.contactNumber}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email Address *</label>
                      <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="e.g. kasun@gmail.com" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if(errors.email) setErrors(err=>({...err, email:null})) }} />
                      {errors.email && <div className="form-error-msg">{errors.email}</div>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Equipment *</label>
                      <select className={`form-select ${errors.resourceId ? 'error' : ''}`} value={form.resourceId} onChange={e => { setForm(f => ({ ...f, resourceId: e.target.value })); if(errors.resourceId) setErrors(err=>({...err, resourceId:null})) }}>
                        <option value="">Select Equipment</option>
                        {resources.filter(r => r.type === 'EQUIPMENT').map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
                      </select>
                      {errors.resourceId && <div className="form-error-msg">{errors.resourceId}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Quantity *</label>
                      <input type="number" min="1" max={currentAvailable !== null ? currentAvailable : undefined} className={`form-input ${errors.quantity ? 'error' : ''}`} value={form.quantity} onChange={e => { setForm(f => ({ ...f, quantity: e.target.value })); if(errors.quantity) setErrors(err=>({...err, quantity:null})) }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">From Date *</label>
                      <input type="date" className={`form-input ${errors.fromDate ? 'error' : ''}`} value={form.fromDate} onChange={e => { setForm(f => ({ ...f, fromDate: e.target.value })); if(errors.fromDate) setErrors(err=>({...err, fromDate:null})) }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">To Date *</label>
                      <input type="date" className={`form-input ${errors.toDate ? 'error' : ''}`} value={form.toDate} onChange={e => { setForm(f => ({ ...f, toDate: e.target.value })); if(errors.toDate) setErrors(err=>({...err, toDate:null})) }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pickup *</label>
                      <input type="time" className={`form-input ${errors.pickupTime ? 'error' : ''}`} value={form.pickupTime} onChange={e => { setForm(f => ({ ...f, pickupTime: e.target.value })); if(errors.pickupTime) setErrors(err=>({...err, pickupTime:null})) }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Return Time *</label>
                      <input type="time" className={`form-input ${errors.returnTime ? 'error' : ''}`} value={form.returnTime} onChange={e => { setForm(f => ({ ...f, returnTime: e.target.value })); if(errors.returnTime) setErrors(err=>({...err, returnTime:null})) }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Purpose *</label>
                      <input className={`form-input ${errors.purpose ? 'error' : ''}`} placeholder="e.g. Presentation, Event" value={form.purpose} onChange={e => { setForm(f => ({ ...f, purpose: e.target.value })); if(errors.purpose) setErrors(err=>({...err, purpose:null})) }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <input type="checkbox" id="termsCheckbox" checked={form.termsAccepted} onChange={e => { setForm(f => ({ ...f, termsAccepted: e.target.checked })); if(errors.termsAccepted) setErrors(err=>({...err, termsAccepted:null})) }} style={{ marginTop: 4 }} />
                      <label htmlFor="termsCheckbox" style={{ fontSize: 13, color: errors.termsAccepted ? 'var(--danger)' : '#475569', lineHeight: 1.4 }}>
                        <strong>Terms and Conditions *</strong><br/>
                        I agree to use the equipment responsibly and return it on time. Any damage or loss will be my responsibility.
                      </label>
                    </div>
                    {errors.termsAccepted && <div className="form-error-msg" style={{ marginLeft: 24 }}>{errors.termsAccepted}</div>}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Room *</label>
                      <select className={`form-select ${errors.resourceId ? 'error' : ''}`} value={form.resourceId} onChange={e => { setForm(f => ({ ...f, resourceId: e.target.value })); if(errors.resourceId) setErrors(err=>({...err, resourceId:null})) }}>
                        <option value="">Select a room</option>
                        {resources.filter(r => r.type !== 'EQUIPMENT').map(r => <option key={r.id} value={r.id}>{r.name} — {r.location} (cap: {r.capacity})</option>)}
                      </select>
                      {errors.resourceId && <div className="form-error-msg">{errors.resourceId}</div>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Expected Attendees</label>
                      <input className={`form-input ${errors.expectedAttendees ? 'error' : ''}`} type="number" min="1" value={form.expectedAttendees} onChange={e => { setForm(f => ({ ...f, expectedAttendees: e.target.value })); if(errors.expectedAttendees) setErrors(err=>({...err, expectedAttendees:null})) }} placeholder="e.g. 50" />
                      {errors.expectedAttendees && <div className="form-error-msg">{errors.expectedAttendees}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Start Time *</label>
                      <input type="datetime-local" className={`form-input ${errors.startTime ? 'error' : ''}`} value={form.startTime} onChange={e => { setForm(f => ({ ...f, startTime: e.target.value })); if(errors.startTime) setErrors(err=>({...err, startTime:null})) }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">End Time *</label>
                      <input type="datetime-local" className={`form-input ${errors.endTime ? 'error' : ''}`} value={form.endTime} onChange={e => { setForm(f => ({ ...f, endTime: e.target.value })); if(errors.endTime) setErrors(err=>({...err, endTime:null})) }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Purpose *</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {isAdmin ? (
                        <select
                          className="form-select"
                          style={{ width: '160px' }}
                          value={form.purpose === 'MAINTENANCE' ? 'MAINTENANCE' : 'OTHER'}
                          onChange={e => setForm(f => ({ ...f, purpose: e.target.value === 'MAINTENANCE' ? 'MAINTENANCE' : '' }))}
                        >
                          <option value="OTHER">Regular</option>
                          <option value="MAINTENANCE">Maint.</option>
                        </select>
                      ) : null}
                      <input className={`form-input ${errors.purpose ? 'error' : ''}`} value={form.purpose} onChange={e => { setForm(f => ({ ...f, purpose: e.target.value })); if(errors.purpose) setErrors(err=>({...err, purpose:null})) }} placeholder="e.g. Lecture, Meeting" />
                    </div>
                    {errors.purpose && <div className="form-error-msg">{errors.purpose}</div>}
                  </div>

                  {isOverCapacity && (
                    <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c', fontSize: '13px', fontWeight: '700', marginBottom: 6 }}>
                        <AlertTriangle size={14} /> Capacity Warning
                      </div>
                      <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>
                        Hold <strong>{selectedResource.capacity}</strong>, requested <strong>{form.expectedAttendees}</strong>.
                      </p>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Notes</label>
                    <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
                  </div>
                </>
              )}
            </>
          )}
          {modal === 'select_type' && <div style={{ height: 0 }} />}
            </div>
            {modal !== 'select_type' && (
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div>
                {isAdmin && modal !== 'create' && modal.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { handleApprove(modal.id); setModal(null) }} className="btn btn-success">Approve</button>
                    <button onClick={() => { handleReject(modal.id); setModal(null) }} className="btn btn-danger">Reject</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
                {(modal === 'create' || (modal !== 'create' && (isAdmin || modal.userId === user?.id))) && (
                  <button 
                    onClick={handleSave} 
                    className="btn btn-primary" 
                    disabled={saving || (category === 'EQUIPMENT' && currentAvailable !== null && parseInt(form.quantity) > currentAvailable)}
                  >
                    {saving ? 'Saving...' : (modal === 'create' ? 'Submit Booking' : 'Update Booking')}
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
      {/* Cancellation Reason Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Confirm Cancellation</h3>
              <button onClick={() => setCancelModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                Please provide a reason for cancelling this booking. This will be sent to the admin for review.
              </p>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Cancellation Reason <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea 
                  name="cancelReason"
                  className="input" 
                  style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="e.g., The event has been postponed..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setCancelModal(null)} className="btn btn-ghost">Nevermind</button>
              <button 
                onClick={submitCancellation} 
                className="btn btn-danger" 
                disabled={saving || !cancelReason.trim()}
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
              >
                {saving ? 'Submitting...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
      {category === 'ANALYTICS' && isAdmin && analyticsData && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 10 }}><TrendingUp color="#3b82f6" /> System Performance Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Pie Chart: Status Distribution */}
              <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart: Most Popular Resources */}
              <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top 5 Most Booked Resources</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                      {analyticsData.barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Type Utilization */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage by Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {analyticsData.typeData.map((item, idx) => (
                <div key={idx} style={{ padding: '20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>{item.name}</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    {item.count} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Bookings</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Reject Booking</h3>
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                Please provide a reason for rejecting this booking. This will be visible to the student.
              </p>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Rejection Reason <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea 
                  className="input" 
                  style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder="e.g., The room is reserved for a maintenance..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setRejectModal(null)} className="btn btn-ghost">Cancel</button>
              <button 
                onClick={submitRejection} 
                className="btn btn-danger" 
                disabled={saving || !rejectReason.trim()}
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
              >
                {saving ? 'Rejecting...' : 'Reject Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
