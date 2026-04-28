<?php
// ============================================
// API: RSVP — Konfirmasi Kehadiran
// POST  /api/rsvp.php  → simpan RSVP
// GET   /api/rsvp.php  → ambil semua RSVP (opsional, untuk admin)
// ============================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ---- POST: Simpan RSVP ----
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $nama        = trim($body['nama']        ?? '');
    $jumlah_tamu = (int) ($body['jumlah_tamu'] ?? 1);
    $status      = trim($body['status']      ?? '');
    $alasan      = trim($body['alasan']      ?? '');

    // Validasi
    if ($nama === '') {
        jsonResponse(['success' => false, 'message' => 'Nama tidak boleh kosong.'], 422);
    }
    if (!in_array($status, ['hadir', 'tidak'], true)) {
        jsonResponse(['success' => false, 'message' => 'Status tidak valid.'], 422);
    }
    if ($jumlah_tamu < 1 || $jumlah_tamu > 20) {
        jsonResponse(['success' => false, 'message' => 'Jumlah tamu tidak valid.'], 422);
    }
    // Alasan hanya relevan saat tidak hadir
    if ($status === 'hadir') $alasan = '';

    try {
        $db  = getDB();
        $sql = 'INSERT INTO rsvp (nama, jumlah_tamu, status, alasan) VALUES (:nama, :jumlah, :status, :alasan)';
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':nama'   => $nama,
            ':jumlah' => $jumlah_tamu,
            ':status' => $status,
            ':alasan' => $alasan,
        ]);
        jsonResponse([
            'success' => true,
            'message' => 'Konfirmasi kehadiran berhasil disimpan.',
            'id'      => (int) $db->lastInsertId(),
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Gagal menyimpan data: ' . $e->getMessage()], 500);
    }
}

// ---- GET: Ambil semua RSVP ----
if ($method === 'GET') {
    try {
        $db   = getDB();
        $rows = $db->query('SELECT id, nama, jumlah_tamu, status, created_at FROM rsvp ORDER BY created_at DESC')->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
