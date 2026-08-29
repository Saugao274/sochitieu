import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "so_chi_tieu";

let cached = (global as any)._mongo as
  | { client: MongoClient; promise: Promise<MongoClient> }
  | undefined;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error(
      "Thiếu MONGODB_URI. Tạo file .env.local và điền chuỗi kết nối MongoDB."
    );
  }

  if (!cached) {
    const client = new MongoClient(uri);
    cached = { client, promise: client.connect() };
    (global as any)._mongo = cached;
  }
  const client = await cached.promise;
  return client.db(dbName);
}

export async function expensesCol() {
  const db = await getDb();
  const col = db.collection("expenses");
  await col.createIndex({ month: 1, createdAt: 1 });
  return col;
}

export async function cashCol() {
  const db = await getDb();
  const col = db.collection("cashlines");
  await col.createIndex({ month: 1, createdAt: 1 });
  return col;
}
