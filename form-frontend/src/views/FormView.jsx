import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../components/FiesticaStyles.css';

function FormView() {
  const [formData, setFormData] = useState({
    name: '',
    bring_something: 'beer',
    participe_hack: false,
    arrival_time: '',
    comments: '',
    you_are_a_bot: false,
    ip_address: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [ipLoading, setIpLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState(null);

  // Get the user's IP address and check for previous submissions
  useEffect(() => {
    const getIpAndCheckSubmission = async () => {
      try {
        setIpLoading(true);
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const userIp = data.ip;
        
        setFormData(prevData => ({
          ...prevData,
          ip_address: userIp
        }));

        // Check if this IP has already submitted a form
        const { data: existingSubmissions, error } = await supabase
          .from('form-submitted')
          .select('*')
          .eq('ip_address', userIp);


        if (error) throw error;
        
      } catch (error) {
        console.error('Error fetching IP address or checking submission:', error);
        // Set a default value if IP cannot be fetched
        setFormData(prevData => ({
          ...prevData,
          ip_address: 'unknown'
        }));
      } finally {
        setIpLoading(false);
      }
    };

    getIpAndCheckSubmission();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Include the IP address in the submission
      const { error } = await supabase
        .from('form-submitted')
        .insert([formData]);

      if (error) throw error;

      setMessage({ 
        text: '¡Gracias por registrarte! Juan te espera con los brazos abiertos.', 
        type: 'success' 
      });
      
      // Reset form after successful submission but keep IP address
      const userIP = formData.ip_address;
      setFormData({
        name: '',
        bring_something: 'beer',
        participe_hack: false,
        arrival_time: '',
        comments: '',
        you_are_a_bot: false,
        ip_address: userIP
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ 
        text: 'Hubo un error al enviar tus datos. Por favor intenta de nuevo.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Fiestica y Hackathon donde Juan</h1>
      <p>Regístrate para la mejor fiesta del año</p>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          {message.type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {message.type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {message.text}
        </div>
      )}
      
      {alreadySubmitted && previousSubmission && (
        <div className="previous-submission">
          <h3>Tu registro anterior:</h3>
          <p><strong>Nombre:</strong> {previousSubmission.name}</p>
          <p><strong>Traerás:</strong> {
            previousSubmission.bring_something === 'beer' ? 'Cerveza' :
            previousSubmission.bring_something === 'snacks' ? 'Botanas' : 'Nada'
          }</p>
          <p><strong>Participarás en el hackathon:</strong> {previousSubmission.participe_hack ? 'Sí' : 'No'}</p>
          {previousSubmission.arrival_time && (
            <p><strong>Hora de llegada:</strong> {previousSubmission.arrival_time}</p>
          )}
          {previousSubmission.comments && (
            <p><strong>Comentarios:</strong> {previousSubmission.comments}</p>
          )}
        </div>
      )}
      
      {!alreadySubmitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bring_something">¿Qué vas a traer? *</label>
            <select
              id="bring_something"
              name="bring_something"
              value={formData.bring_something}
              onChange={handleChange}
              required
            >
              <option value="beer">Cerveza</option>
              <option value="snacks">Botanas</option>
              <option value="nothing">Nada (qué mal plan)</option>
            </select>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="participe_hack"
                checked={formData.participe_hack}
                onChange={handleChange}
              />
              ¿Participas en el hackathon?
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="arrival_time">Hora estimada de llegada</label>
            <input
              type="time"
              id="arrival_time"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="comments">Comentarios</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="¿Algo que debamos saber? ¿Alergias? ¿Traes algún juego de mesa?"
              rows="3"
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="you_are_a_bot"
                checked={formData.you_are_a_bot}
                onChange={handleChange}
              />
              ¿Eres un bot?
            </label>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                Enviando...
              </>
            ) : 'Registrarse'}
          </button>
        </form>
      ) : (
        <div className="already-submitted-message">
          <p>Si necesitas modificar tu registro, por favor contacta a Juan directamente.</p>
        </div>
      )}
    </div>
  );
}

export default FormView;