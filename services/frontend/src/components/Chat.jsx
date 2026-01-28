import { useState, useEffect, useRef } from 'react';

function Chat({ user, token, evento, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Establecer conexion WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}&eventoId=${evento.id}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket conectado');
      setConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat_message') {
          setMessages((prev) => [...prev, data.mensaje]);
          scrollToBottom();
        } else if (data.type === 'connected') {
          console.log('Autenticado en WebSocket');
        }
      } catch (error) {
        console.error('Error procesando mensaje:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket desconectado');
      setConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('Error WebSocket:', error);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [token, evento.id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${evento.id}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !connected) return;

    try {
      // Enviar por WebSocket
      ws.send(JSON.stringify({
        type: 'chat_message',
        contenido: newMessage.trim()
      }));

      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h3>Chat del Evento</h3>
          <p className="chat-event-title">{evento.titulo}</p>
        </div>
        <div className="chat-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></span>
          {connected ? 'Conectado' : 'Desconectado'}
        </div>
        <button className="chat-close" onClick={onClose}>
          x
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No hay mensajes aun. Se el primero en escribir!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`chat-message ${
                message.usuario_id === user.id ? 'own-message' : 'other-message'
              }`}
            >
              <div className="message-header">
                <span className="message-author">{message.usuario_nombre}</span>
                <span className="message-time">{formatTime(message.fecha_envio)}</span>
              </div>
              <div className="message-content">{message.contenido}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !newMessage.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Chat;
