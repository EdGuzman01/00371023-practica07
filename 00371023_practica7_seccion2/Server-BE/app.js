import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 5000;
const JWT_SECRET = "tu_clave_secreta_jwt_muy_segura";

// Middlewares
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// "Base de datos" temporal (en memoria)
const users = [];

// Middleware: Verificar Token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "Acceso no autorizado - Token requerido" 
    });
  }

  const token = authHeader.split(" ")[1];
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: "Token inválido o expirado" 
      });
    }
    req.user = user;
    next();
  });
};

// Ruta de registro de usuario
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son requeridos" 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "El usuario ya existe" 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };
    
    users.push(newUser);
    console.log("✅ Usuario registrado:", { id: newUser.id, email: newUser.email });

    res.status(201).json({ 
      success: true,
      message: "Usuario registrado exitosamente" 
    });
    
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
});

// Ruta de login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email y contraseña son requeridos" 
      });
    }
    
    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Credenciales inválidas" 
      });
    }

    // Generar token JWT
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ Login exitoso para:", email);

    res.status(200).json({ 
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
});

// Ruta protegida - ejemplo
app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "🎉 ¡Acceso a datos protegidos exitoso!", 
    user: req.user,
    data: {
      mensajeSecreto: "Esta es información confidencial",
      fecha: new Date().toISOString()
    }
  });
});

// Ruta para obtener perfil de usuario
app.get("/profile", verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: "Usuario no encontrado" 
    });
  }
  
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

// Ruta de verificación de salud del servidor
app.get("/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "🚀 Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    totalUsuarios: users.length
  });
});

// ✅ CORREGIDO: Manejo de rutas no encontradas - FORMA CORRECTA
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Ruta no encontrada" 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✨ ==============================================`);
  console.log(`✅ Servidor Express ejecutándose en:`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🕒 Iniciado: ${new Date().toLocaleString()}`);
  console.log(`✨ ==============================================\n`);
  
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST   http://localhost:${PORT}/register`);
  console.log(`   POST   http://localhost:${PORT}/login`);
  console.log(`   GET    http://localhost:${PORT}/protected`);
  console.log(`   GET    http://localhost:${PORT}/profile`);
  console.log(`   GET    http://localhost:${PORT}/health`);
});