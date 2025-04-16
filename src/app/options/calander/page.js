"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Info,
  Stethoscope,
  RefreshCw,
  Shield,
  AlertCircle,
  FilePlus,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Helper function to format date as yyyy-mm-dd
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Helper function to get month name
function getMonthName(month) {
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return monthNames[month];
}

// Helper function to get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper function to get weekday (0 = Monday, 6 = Sunday)
function getWeekday(year, month, day) {
  const weekday = new Date(year, month, day).getDay();
  return weekday === 0 ? 6 : weekday - 1; // Adjust to make Monday=0, Sunday=6
}

export default function EventCalendar() {
  const router = useRouter();

  // State for current date view
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [events, setEvents] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(currentDate));
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDateLoading, setSelectedDateLoading] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const [filterTypes, setFilterTypes] = useState({
    test: true,
    prophylaxie: true,
  });

  // Load events for current month and year
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const BASE_URL = "http://localhost:3001/api";
        const response = await fetch(
          `${BASE_URL}/events?month=${currentMonth}&year=${currentYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        if (data.success) {
          setEvents(data.data.events);
          setEventsByDate(data.data.eventsByDate);
        } else {
          throw new Error(data.error || "Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentMonth, currentYear]);

  // Load events for selected date
  useEffect(() => {
    const fetchEventsByDate = async () => {
      if (!selectedDate) return;

      try {
        setSelectedDateLoading(true);
        const BASE_URL = "http://localhost:3001/api";
        const response = await fetch(`${BASE_URL}/events/${selectedDate}`);

        if (!response.ok) {
          throw new Error("Failed to fetch events for selected date");
        }

        const data = await response.json();

        if (data.success) {
          setSelectedDateEvents(data.data);
        } else {
          throw new Error(
            data.error || "Failed to fetch events for selected date"
          );
        }
      } catch (err) {
        console.error("Error fetching events for date:", err);
        setError(err.message);
      } finally {
        setSelectedDateLoading(false);
      }
    };

    fetchEventsByDate();
  }, [selectedDate]);

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(formatDate(today));
  };

  // Handle date selection
  const handleDateClick = (day) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    setSelectedDate(formatDate(dateObj));
  };

  // Toggle event details
  const toggleEventDetails = (eventId) => {
    setShowDetails((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Check if date has events
  const hasEvents = (day) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    return eventsByDate[dateStr] && eventsByDate[dateStr].length > 0;
  };

  // Get event count for a day
  const getEventCount = (day) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    return (eventsByDate[dateStr] || []).length;
  };

  // Filter events by type
  const filteredEvents = selectedDateEvents.filter(
    (event) => filterTypes[event.type]
  );

  // Build calendar layout
  const buildCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayWeekday = getWeekday(currentYear, currentMonth, 1);
    const calendarDays = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return calendarDays;
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const calendarDays = buildCalendarDays();
    const rows = [];
    let cells = [];

    // Header row with weekday names
    const weekdayHeader = (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );

    // Calendar cells
    calendarDays.forEach((day, i) => {
      const isToday =
        day &&
        currentYear === new Date().getFullYear() &&
        currentMonth === new Date().getMonth() &&
        day === new Date().getDate();

      const isSelected =
        day &&
        selectedDate === formatDate(new Date(currentYear, currentMonth, day));

      const dateHasEvents = day && hasEvents(day);
      const eventCount = day ? getEventCount(day) : 0;

      cells.push(
        <div
          key={i}
          className={`
            relative h-20 md:h-24 p-1 border rounded-lg transition-all 
            ${
              !day
                ? "bg-gray-50 border-gray-100"
                : "border-gray-200 cursor-pointer hover:border-[#1B4D3E]/50"
            }
            ${isToday ? "bg-blue-50/50" : "bg-white/70"}
            ${isSelected ? "border-[#1B4D3E] shadow-sm" : ""}
          `}
          onClick={() => day && handleDateClick(day)}
        >
          {day && (
            <>
              <div
                className={`
                text-right text-sm font-medium mb-1 
                ${isToday ? "text-blue-700" : "text-gray-900"}
              `}
              >
                {day}
              </div>

              {dateHasEvents && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="flex items-center justify-between">
                    <div
                      className={`
                      h-2 w-2 rounded-full 
                      ${eventCount > 0 ? "bg-[#1B4D3E]" : "bg-transparent"}
                    `}
                    ></div>
                    {eventCount > 0 && (
                      <span className="text-xs text-[#1B4D3E] font-medium">
                        {eventCount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );

      // Break into rows after every 7 cells
      if (cells.length === 7) {
        rows.push(
          <div key={rows.length} className="grid grid-cols-7 gap-1 mb-1">
            {cells}
          </div>
        );
        cells = [];
      }
    });

    // Add any remaining cells as the last row
    if (cells.length > 0) {
      rows.push(
        <div key={rows.length} className="grid grid-cols-7 gap-1 mb-1">
          {cells}
        </div>
      );
    }

    return (
      <div>
        {weekdayHeader}
        {rows}
      </div>
    );
  };

  // Get event type icon
  const getEventIcon = (type) => {
    if (type === "test") {
      return <Stethoscope className="w-5 h-5 text-blue-600" />;
    } else if (type === "prophylaxie") {
      return <Shield className="w-5 h-5 text-green-600" />;
    }
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  // Get event type color
  const getEventTypeColor = (type) => {
    if (type === "test") {
      return "bg-blue-100 text-blue-800";
    } else if (type === "prophylaxie") {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  // Get horse state indicator
  const getHorseStateIndicator = (horse) => {
    if (!horse || !horse.etat) return null;

    let color = "bg-gray-200";
    if (horse.etat === "sain") {
      color = "bg-green-500";
    } else if (horse.etat === "malade") {
      color = "bg-red-500";
    } else if (horse.etat === "en rétablissement") {
      color = "bg-yellow-500";
    }

    return (
      <div
        className={`h-3 w-3 rounded-full ${color}`}
        title={`État: ${horse.etat}`}
      ></div>
    );
  };

  // Format date for display
  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <div className="flex justify-between items-center mt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E]">
                Calendrier des Rappels
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion des suivis et événements programmés
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153729] transition-colors flex items-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Aujourd'hui
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Column */}
          <div className="lg:w-2/3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
              {/* Calendar Navigation */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-xl font-semibold text-[#1B4D3E]">
                    {getMonthName(currentMonth)} {currentYear}
                  </h2>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <div className="h-3 w-3 rounded-full bg-[#1B4D3E]"></div>
                    <span>Événements</span>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4D3E] mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement du calendrier...</p>
                </div>
              ) : (
                renderCalendarGrid()
              )}
            </div>
          </div>

          {/* Events for Selected Date Column */}
          <div className="lg:w-1/3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 sticky top-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#1B4D3E] mb-2">
                  {formatDisplayDate(selectedDate)}
                </h2>

                {/* Type Filters */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() =>
                      setFilterTypes((prev) => ({ ...prev, test: !prev.test }))
                    }
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                      filterTypes.test
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <Stethoscope className="w-3 h-3" />
                    Tests
                  </button>
                  <button
                    onClick={() =>
                      setFilterTypes((prev) => ({
                        ...prev,
                        prophylaxie: !prev.prophylaxie,
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                      filterTypes.prophylaxie
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    Prophylaxie
                  </button>
                </div>
              </div>

              {selectedDateLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1B4D3E] mx-auto mb-2"></div>
                  <p className="text-gray-500">Chargement des événements...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleEventDetails(event.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            {getEventIcon(event.type)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {event.horse?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getHorseStateIndicator(event.horse)}
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 transition-transform ${
                                showDetails[event.id] ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Rappel programmé pour: {formatEventDate(event.date)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type === "test"
                              ? "Test Médical"
                              : "Prophylaxie"}
                          </span>
                        </div>
                      </div>

                      {showDetails[event.id] && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="mb-3">
                            <span className="text-xs text-gray-500">
                              Détails de l'événement
                            </span>
                          </div>

                          {event.type === "test" ? (
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">
                                  Type de test:
                                </span>{" "}
                                {event.details.type}
                              </p>
                              {event.details.diagnostiques && (
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Diagnostique:
                                  </span>{" "}
                                  {event.details.diagnostiques}
                                </p>
                              )}
                              {event.details.traitements && (
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Traitement:
                                  </span>{" "}
                                  {event.details.traitements}
                                </p>
                              )}
                              <p className="text-sm">
                                <span className="font-medium">
                                  Responsable:
                                </span>{" "}
                                {event.details.username}
                              </p>
                              {event.details.dateInitiale && (
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Date initiale:
                                  </span>{" "}
                                  {formatEventDate(event.details.dateInitiale)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">Type:</span>{" "}
                                {event.details.type}
                              </p>
                              {/* {event.details.details && (
                                <p className="text-sm">
                                  <span className="font-medium">Détails:</span>{" "}
                                  {event.details.details.typeIntervention}
                                </p>
                              )} */}
                              {event.details.notes && (
                                <p className="text-sm">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {event.details.notes}
                                </p>
                              )}
                              {event.details.dateInitiale && (
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Date initiale:
                                  </span>{" "}
                                  {formatEventDate(event.details.dateInitiale)}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mt-4 flex justify-end">
                            <Link
                              href={`/options/${
                                event.type === "test"
                                  ? "edit-consultation"
                                  : "prophylaxie/edit"
                              }?${event.type === "test" ? "testId" : "id"}=${
                                event.id
                              }`}
                              className="px-3 py-1 text-sm bg-[#1B4D3E] text-white rounded-lg hover:bg-[#153729] transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Mettre à jour
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">
                    Aucun événement programmé pour cette date
                  </p>
                  <Link
                    href="/options/choix"
                    className="px-4 py-2 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153729] transition-colors inline-flex items-center gap-2"
                  >
                    <FilePlus className="w-4 h-4" />
                    Nouvelle Consultation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
