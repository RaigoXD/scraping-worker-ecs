import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../components/FiesticaStyles.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Set default Chart.js options for better responsiveness
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

function DashboardView() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch attendees data when component mounts
    fetchAttendees();
  }, []);

  async function fetchAttendees() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('form-submitted')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAttendees(data || []);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      setError('No se pudieron cargar los datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'No especificado';
    
    // Add better time formatting
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes} hrs`;
    } catch (e) {
      return timeString;
    }
  };

  // Format values for display
  const formatBoolean = (value) => value ? 'Sí' : 'No';
  
  const formatBringSomething = (value) => {
    const options = {
      'beer': 'Cerveza 🍺',
      'snacks': 'Botanas 🍿',
      'nothing': 'Nada 😢'
    };
    return options[value] || value;
  };

  // Data processing for charts
  const prepareChartData = () => {
    if (!attendees || attendees.length === 0) return null;

    // Prepare data for the "What people bring" pie chart
    const bringCounts = attendees.reduce((acc, attendee) => {
      const item = attendee.bring_something;
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    const bringLabels = {
      'beer': 'Cerveza 🍺',
      'snacks': 'Botanas 🍿',
      'nothing': 'Nada 😢'
    };

    const bringData = {
      labels: Object.keys(bringCounts).map(key => bringLabels[key] || key),
      datasets: [
        {
          data: Object.values(bringCounts),
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',  // yellow for beer
            'rgba(75, 192, 192, 0.7)',  // teal for snacks
            'rgba(255, 99, 132, 0.7)',  // pink for nothing
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Pie chart options
    const pieOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        }
      }
    };

    // Prepare data for hackathon participation pie chart
    const hackathonParticipation = attendees.reduce(
      (acc, attendee) => {
        attendee.participe_hack ? acc.yes++ : acc.no++;
        return acc;
      },
      { yes: 0, no: 0 }
    );

    const hackathonData = {
      labels: ['Participan', 'No participan'],
      datasets: [
        {
          data: [hackathonParticipation.yes, hackathonParticipation.no],
          backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };

    // Prepare data for arrival time bar chart
    const timeSlots = {};
    
    // Group attendance by hour
    attendees.forEach(attendee => {
      if (attendee.arrival_time) {
        const hour = attendee.arrival_time.split(':')[0];
        timeSlots[hour] = (timeSlots[hour] || 0) + 1;
      }
    });

    // Sort by hour
    const sortedTimeSlots = Object.entries(timeSlots)
      .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
      .reduce((acc, [hour, count]) => {
        acc[`${hour}:00`] = count;
        return acc;
      }, {});

    const arrivalTimeData = {
      labels: Object.keys(sortedTimeSlots),
      datasets: [
        {
          label: 'Hora de llegada',
          data: Object.values(sortedTimeSlots),
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };

    // Bar chart options
    const barOptions = {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: 10
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 10
            }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Número de personas por hora',
          font: {
            size: 12
          }
        },
        legend: {
          display: false
        }
      }
    };

    return {
      bringData,
      hackathonData,
      arrivalTimeData,
      pieOptions,
      barOptions
    };
  };

  const chartData = attendees.length > 0 ? prepareChartData() : null;

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Asistentes</h1>
      <p>Lista de personas que asistirán a la fiestica y hackathon</p>
      
      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
      
      <button 
        onClick={fetchAttendees} 
        disabled={loading}
        className="refresh-button"
      >
        {loading ? (
          <>
            <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            Cargando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <polyline points="23 20 23 14 17 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            Actualizar datos
          </>
        )}
      </button>
      
      {loading ? (
        <div className="loading">
          <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <p>Cargando datos...</p>
        </div>
      ) : attendees.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>Sin asistentes registrados</h3>
          <p>Juan aún no sabe que se le va a llenar la casa... por ahora todo está en calma.</p>
        </div>
      ) : (
        <>
          <div className="charts-container">
            <div className="chart-section">
              <h2>Estadísticas de la Fiesta</h2>
              
              <div className="chart-grid">
                <div className="chart-card">
                  <h3>¿Qué traen los invitados?</h3>
                  <div className="chart-wrapper">
                    {chartData && <Pie data={chartData.bringData} options={chartData.pieOptions} />}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Participación en Hackathon</h3>
                  <div className="chart-wrapper">
                    {chartData && <Pie data={chartData.hackathonData} options={chartData.pieOptions} />}
                  </div>
                </div>
                
                <div className="chart-card bar-chart">
                  <h3>Horas de llegada</h3>
                  <div className="chart-wrapper">
                    {chartData && <Bar 
                      data={chartData.arrivalTimeData} 
                      options={chartData.barOptions} 
                    />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="attendees-table-container">
            <h2>Lista de Asistentes</h2>
            <table className="attendees-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Trae</th>
                  <th>Hackathon</th>
                  <th>Hora de llegada</th>
                  <th>Comentarios</th>
                  <th>¿Es un bot?</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td>{attendee.name}</td>
                    <td>{formatBringSomething(attendee.bring_something)}</td>
                    <td>{formatBoolean(attendee.participe_hack)}</td>
                    <td>{formatTime(attendee.arrival_time)}</td>
                    <td>{attendee.comments || 'Sin comentarios'}</td>
                    <td>{formatBoolean(attendee.you_are_a_bot)}</td>
                    <td>{attendee.ip_address || 'No disponible'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardView;