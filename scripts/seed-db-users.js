import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "db.json");

const USER_HASH = bcrypt.hashSync("user1234", 10);
const ADMIN_HASH = bcrypt.hashSync("admin1234", 10);

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

db.users = [
  {
    id: "u-user",
    name: "Ana Teste",
    firstName: "Ana",
    lastName: "Teste",
    email: "user@zenify.pt",
    password: USER_HASH,
    role: "user",
  },
  {
    id: "u-admin",
    name: "Admin Zenify",
    firstName: "Admin",
    lastName: "Zenify",
    email: "admin@zenify.pt",
    password: ADMIN_HASH,
    role: "admin",
  },
];

function remapUserId(value) {
  if (value === "bc36") return "u-user";
  return value;
}

for (const collection of [
  "userProgress",
  "moodLogs",
  "userNotifications",
  "checkins",
]) {
  if (!Array.isArray(db[collection])) continue;

  db[collection] = db[collection]
    .filter((row) => row.userId !== 1781012145505)
    .map((row) => ({
      ...row,
      userId: remapUserId(row.userId),
      id:
        row.id === "progress-bc36" ? "progress-u-user"
        : row.id,
    }));
}

fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`);
console.log("db.json atualizado com utilizadores de teste (u-user, u-admin).");
