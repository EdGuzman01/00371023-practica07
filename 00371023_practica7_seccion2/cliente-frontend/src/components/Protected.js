import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const Protected = () => {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos protegidos
        const protectedResponse = await API.get("/protected");
        setMessage(protectedResponse.data.message);

        // Obtener perfil de usuario
        const profileResponse = await API.get("/profile");
        setUserData(profileResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("❌ Error:", err);
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert("Sesión expirada. Por favor inicia sesión nuevamente.");
          navigate("/login");
        }
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <div style={{ 
        backgroundColor: "#e8f5e8", 
        padding: "20px", 
        borderRadius: "10px",
        marginBottom: "20px",
        border: "1px solid #4caf50"
      }}>
        <h1 style={{ color: "#2e7d32", textAlign: "center" }}>🔐 Área Protegida</h1>
        <div style={{ 
          backgroundColor: "white", 
          padding: "15px", 
          borderRadius: "5px",
          marginTop: "15px"
        }}>
          <h2 style={{ color: "#28a745" }}>{message}</h2>
          
          {userData && (
            <div style={{ marginTop: "20px" }}>
              <h3>👤 Información del Usuario:</h3>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Nombre:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              {userData.createdAt && (
                <p><strong>Fecha de registro:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ textAlign: "center" }}>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#dc3545", 
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Protected;