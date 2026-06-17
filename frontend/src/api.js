const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// Auth
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// Users
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`, { headers: authHeaders() });
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  return res.json();
}

// Desa
export async function getDesa() {
  const res = await fetch(`${BASE_URL}/desa`, { headers: authHeaders() });
  return res.json();
}

export async function createDesa(nama_desa) {
  const res = await fetch(`${BASE_URL}/desa`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama_desa }),
  });
  return res.json();
}

export async function updateDesa(id, nama_desa) {
  const res = await fetch(`${BASE_URL}/desa`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ id, nama_desa }),
  });
  return res.json();
}

export async function deleteDesa(id) {
  const res = await fetch(`${BASE_URL}/desa`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  return res.json();
}

// Kelompok
export async function getKelompok(desa_id) {
  const url = desa_id ? `${BASE_URL}/kelompok?desa_id=${desa_id}` : `${BASE_URL}/kelompok`;
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

export async function createKelompok(nama_kelompok, desa_id) {
  const res = await fetch(`${BASE_URL}/kelompok`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama_kelompok, desa_id }),
  });
  return res.json();
}

export async function updateKelompok(id, nama_kelompok, desa_id) {
  const res = await fetch(`${BASE_URL}/kelompok`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ id, nama_kelompok, desa_id }),
  });
  return res.json();
}

export async function deleteKelompok(id) {
  const res = await fetch(`${BASE_URL}/kelompok`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  return res.json();
}

// Pencatatan
export async function getPencatatan(header_id) {
  const url = header_id
    ? `${BASE_URL}/pencatatan?header_id=${header_id}`
    : `${BASE_URL}/pencatatan`;
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

export async function createPencatatanHeader(bulan, tahun) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ type: "header", bulan, tahun }),
  });
  return res.json();
}

export async function updatePencatatanHeader(id, bulan, tahun) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ type: "header", id, bulan, tahun }),
  });
  return res.json();
}

export async function deletePencatatanHeader(id) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ type: "header", id }),
  });
  return res.json();
}

export async function createPencatatanDetail(header_id, nama, jenis, nominal, tanggal) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ type: "detail", header_id, nama, jenis, nominal, tanggal }),
  });
  return res.json();
}

export async function updatePencatatanDetail(id, nama, jenis, nominal, tanggal) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ type: "detail", id, nama, jenis, nominal, tanggal }),
  });
  return res.json();
}

export async function deletePencatatanDetail(id) {
  const res = await fetch(`${BASE_URL}/pencatatan`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ type: "detail", id }),
  });
  return res.json();
}
