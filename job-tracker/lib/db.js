import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const LIST_KEY = "applications";

export async function getApplications() {
  const list = await redis.get(LIST_KEY);
  return list || [];
}

export async function saveApplications(list) {
  await redis.set(LIST_KEY, list);
}

export async function addApplication(entry) {
  const list = await getApplications();
  list.push(entry);
  await saveApplications(list);
  return entry;
}

export async function updateApplication(id, changes) {
  const list = await getApplications();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...changes };
  await saveApplications(list);
  return list[idx];
}

export async function deleteApplication(id) {
  const list = await getApplications();
  const next = list.filter((e) => e.id !== id);
  await saveApplications(next);
  return true;
}
