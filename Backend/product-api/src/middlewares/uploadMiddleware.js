const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const PROJECT_UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

// En plataformas como Enzonic Deploy el código es de solo lectura (/var/task).
// Se busca un directorio escribible: UPLOADS_DIR → carpeta del proyecto → /tmp.
const resolveUploadsDir = () => {
  const candidates = [
    process.env.UPLOADS_DIR,
    PROJECT_UPLOADS_DIR,
    path.join(os.tmpdir(), "comandapp-uploads"),
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch (error) {
      console.warn(
        `No se pudo usar "${dir}" para uploads: ${error.code || error.message}`,
      );
    }
  }

  throw new Error("No hay un directorio escribible para las imágenes subidas");
};

const UPLOADS_DIR = resolveUploadsDir();

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = EXTENSIONS[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (EXTENSIONS[file.mimetype]) {
    return cb(null, true);
  }
  const error = new Error("Solo se permiten imágenes (JPEG, PNG, WebP o GIF)");
  error.statusCode = 400;
  return cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const isInternalImage = (url) =>
  typeof url === "string" && url.includes("/uploads/");

const deleteUploadedFile = (url) => {
  if (!isInternalImage(url)) return;
  const filename = url.split("/").pop();
  if (!filename) return;
  fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
};

module.exports = {
  upload,
  UPLOADS_DIR,
  isInternalImage,
  deleteUploadedFile,
};