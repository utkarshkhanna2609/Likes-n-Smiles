import express from 'express';
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv"; 
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import {register} from "./controllers/auth.js";
import userRoutes from "./routes/users.js";
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import { verifyToken } from './middleware/auth.js';
import {createPost} from './controllers/posts.js'; 
// Configs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }, 
});

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true })); 
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

//console.log(process.env.MONGO_URL);

const upload = multer({ storage });  
app.post('/auth/register', upload.single("picture"), register);
app.post('/posts',verifyToken, upload.single("picture"), createPost);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts",postRoutes);

const PORT = process.env.PORT || 6592;

mongoose.connect(process.env.MONGO_URL,   {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}).catch((err) => console.log(err));
