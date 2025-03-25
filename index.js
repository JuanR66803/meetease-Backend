import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Configuración de la base de datos
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: La variable de entorno MONGO_URI no está definida.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err);
        process.exit(1);
    });

// 🔹 Middlewares
app.use(express.json());

// 🔹 Configuración de CORS
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://meetease-frontend.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowedOrigin => 
            origin.startsWith(allowedOrigin)
        )) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// 🔹 Definir rutas
app.use("/api", authRoutes);

// 🔹 Ruta de prueba
app.get("/", (req, res) => {
    res.json({ message: "MeetEase Backend funcionando correctamente 🚀" });
});

// 🔹 Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// 🔹 Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Ocurrió un error en el servidor", 
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// 🔹 Iniciar servidor
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
}

export default app;


