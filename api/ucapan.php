<?php
// ============================================
// API: Ucapan & Doa (Guestbook)
// POST  /api/ucapan.php  → simpan ucapan
// GET   /api/ucapan.php  → ambil semua ucapan (terbaru di atas)
// ============================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ---- POST: Simpan Ucapan ----
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $nama = trim($body['nama'] ?? '');
    $pesan = trim($body['pesan'] ?? '');

    if ($nama === '') {
        jsonResponse(['success' => false, 'message' => 'Nama tidak boleh kosong.'], 422);
    }
    if ($pesan === '') {
        jsonResponse(['success' => false, 'message' => 'Pesan tidak boleh kosong.'], 422);
    }

    // Batasi panjang
    $nama = mb_substr($nama, 0, 150);
    $pesan = mb_substr($pesan, 0, 1000);

    try {
        $db = getDB();
        $stmt = $db->prepare('INSERT INTO ucapan (nama, pesan) VALUES (:nama, :pesan)');
        $stmt->execute([':nama' => $nama, ':pesan' => $pesan]);

        $id = (int) $db->lastInsertId();

        // Kembalikan data yang baru disimpan
        $row = $db->query("SELECT id, nama, pesan, created_at FROM ucapan WHERE id = $id")->fetch();
        jsonResponse(['success' => true, 'message' => 'Ucapan berhasil disimpan.', 'data' => $row]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Gagal menyimpan: ' . $e->getMessage()], 500);
    }
}

// ---- GET: Ambil semua ucapan ----
if ($method === 'GET') {
    $limit = min((int) ($_GET['limit'] ?? 20), 100);
    $offset = max((int) ($_GET['offset'] ?? 0), 0);

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT id, nama, pesan, created_at FROM ucapan ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $total = (int) $db->query('SELECT COUNT(*) FROM ucapan')->fetchColumn();
        jsonResponse(['success' => true, 'total' => $total, 'data' => $rows]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
