import type { InvoiceItem } from '../types';

export const INVOICE_STYLE = `
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @page {
    size: A4;
    margin: 0;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12px;
    line-height: 1.4;
    background-color: #f5f5f5;
    padding: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .page-container {
    width: 210mm;
    min-height: 297mm;
    background: white;
    margin: 0 auto;
    padding: 28mm 18mm 25mm 18mm;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .header {
    text-align: center;
    margin-bottom: 25px;
  }

  .header h1 {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 2px;
    margin-bottom: 30px;
    color: #000;
  }

  .company-info {
    font-family: 'Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', sans-serif;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2px;
  }

  .company-left {
    display: flex;
    align-items: flex-start;
    gap: 3px;
    flex: 1;
  }

  .company-logo {
    width: 70px;
    height: auto;
  }

  .company-details {
    text-align: left;
  }

  .company-details h2 {
    font-size: 22px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 3px;
  }

  .company-details p {
    font-size: 13px;
    line-height: 1.2;
    margin: 1px 0;
  }

  .invoice-info-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .invoice-box {
    border: 2px solid #000;
    padding: 8px 10px;
    min-width: 210px;
    margin-right: 0px;
  }

  .invoice-box p {
    font-size: 14px;
    margin: 2px 0;
    line-height: 1;
  }

  .invoice-box strong {
    font-weight: bold;
  }

  .separator {
    border-top: 2px solid #000;
    margin: 14px 0 30px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }

  table th {
    background-color: #c0c0c0;
    border: 1px solid #000;
    padding: 8px 6px;
    text-align: center;
    font-size: 13px;
    font-weight: bold;
    line-height: 1.2;
  }

  table td {
    border: 1px solid #000;
    padding: 6px 8px;
    font-size: 16px;
    line-height: 1.3;
  }

  table td:nth-child(1) {
    text-align: center;
    width: 50px;
  }

  table td:nth-child(2) {
    text-align: left;
    width: 180px;
  }

  table td:nth-child(3) {
    text-align: center;
    width: 70px;
  }

  table td:nth-child(4),
  table td:nth-child(5) {
    text-align: center;
    width: 110px;
  }

  .total-section {
    width: 100%;
    margin-top: 0;
  }

  .total-row {
    display: flex;
    justify-content: flex-end;
    border: 1px solid #000;
    border-top: none;
    border-left: none;
    border-bottom: none;
  }

  .total-label {
    padding: 6px 8px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    line-height: 1.3;
    border-right: 1px solid #000;
    width: 120px;
  }

  .total-value {
    padding: 6px 8px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #000;
    border-top: none;
    border-left: none;
    border-right: none;
    font-size: 16px;
    width: 277px;
  }

  .payment-info {
    font-size: 16px;
    margin: 35px 0 65px 0;
    text-align: left;
  }

  .footer {
    margin-top: 35px;
    text-align: right;
  }

  .footer p {
    font-size: 16px;
    margin: 4px 0;
  }

  .hormat-kami {
    padding-right: 28px;
  }

  .signature-space {
    margin-top: 80px;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }

    .page-container {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 18mm 10mm 18mm !important;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
  }
`;

export const SURAT_JALAN_STYLE = `
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @page {
    size: A4;
    margin: 0;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12px;
    line-height: 1.4;
    background-color: #f5f5f5;
    padding: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .page-container {
    width: 210mm;
    min-height: 297mm;
    background: white;
    margin: 0 auto;
    padding: 28mm 18mm 25mm 18mm;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    font-family: 'Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', sans-serif;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #000;
    padding-bottom: 5px;
    margin-bottom: 2px;
  }

  .company-info {
    display: flex;
    align-items: center;
    gap: 7px;
    flex: 1;
  }

  .company-logo {
    width: 65px;
    height: auto;
  }

  .company-details h2 {
    font-size: 24px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .company-details p {
    font-size: 12px;
    line-height: 1.1;
    margin: 0;
  }

  .document-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .vertical-bar {
    width: 5px;
    height: 75px;
    background-color: #000;
  }

  .document-title h1 {
    font-size: 36px;
    font-weight: bold;
    line-height: 1.1;
    letter-spacing: 1px;
  }

  .header-underline {
    border-bottom: 1px solid #000;
    margin-bottom: 35px;
  }

  .content-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    font-size: 16px;
  }

  .recipient-info {
    line-height: 1.3;
  }

  .recipient-info strong {
    font-size: 18px;
  }

  .date-info {
    text-align: right;
  }

  .opening-text {
    margin-bottom: 20px;
    font-size: 16px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 40px;
  }

  table th {
    background-color: #c0c0c0;
    border: 1px solid #000;
    padding: 10px 8px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.2;
  }

  table td {
    border: 1px solid #000;
    padding: 10px 8px;
    font-size: 16px;
    line-height: 1.3;
    vertical-align: middle;
  }

  table td:nth-child(1) {
    text-align: center;
    width: 50px;
  }

  table td:nth-child(2) {
    text-align: left;
    width: 230px;
  }

  table td:nth-child(3) {
    text-align: center;
    width: 100px;
  }

  table td:nth-child(4) {
    text-align: center;
    width: 260px;
  }

  .received-date {
    margin-bottom: 40px;
    font-size: 16px;
  }

  .signature-section {
    display: flex;
    justify-content: space-around;
    text-align: center;
    font-size: 16px;
  }

  .signature-box {
    width: 200px;
  }

  .signature-space {
    margin-top: 100px;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }

    .page-container {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 18mm 10mm 18mm !important;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
  }
`;

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

const getDateStr = () => {
  const today = new Date();
  return today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const buildInvoiceHTML = (items: InvoiceItem[], _titleName: string, showEmptyDate = true): string => {
  const dateStr = showEmptyDate ? '' : getDateStr();
  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const rows = items.map((item, index) => {
    const tipeStr = item.tipe === '-' ? '' : item.tipe;
    const autoInv = [item.name, tipeStr, item.note].filter(Boolean).join(' ');
    const ket = item.invKeterangan || autoInv;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${ket.trim().replace(/\n/g, '<br>')}</td>
        <td>${item.qty} ${item.qtyUnit || 'pcs'}</td>
        <td>Rp ${formatNumber(item.price)}</td>
        <td>Rp ${formatNumber(item.price * item.qty)}</td>
      </tr>
    `;
  }).join('');

  // Embed logo image as a local path fallback
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - Berkah Maju Elektrik</title>
  <style>
${INVOICE_STYLE}
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <h1>INVOICE</h1>
    </div>

    <div class="company-info">
      <div class="company-left">
        <img src="/assets/icons/logo-bme.png" alt="Logo" class="company-logo" onerror="this.src='https://qydhvqhkmmrfizawfgvx.supabase.co/storage/v1/object/public/icons/logo-bme.png';">
        <div class="company-details">
          <h2>BERKAH MAJU ELEKTRIK</h2>
          <p>Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
          <p>0855-9174-9020 / 0853-1212-2030</p>
          <p>Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
        </div>
      </div>
      <div class="invoice-info-container">
        <div class="invoice-box">
          <p>Tanggal : ${dateStr}</p>
        </div>
        <div class="invoice-box">
          <p>Kepada :</p>
          <p><strong>PT. SARASWANTI INDO GENETECH</strong></p>
        </div>
      </div>
    </div>

    <div class="separator"></div>
    
    <table>
      <thead>
        <tr>
          <th>NO</th>
          <th>KETERANGAN</th>
          <th>QTY</th>
          <th>HARGA<br>SATUAN</th>
          <th>JUMLAH</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
    
    <div class="total-section">
      <div class="total-row">
        <div class="total-label">JUMLAH</div>
        <div class="total-value">Rp ${formatNumber(total)}</div>
      </div>
    </div>

    <div class="payment-info">
      <p>Pembayaran Bisa melalui rekening Bank <strong>BCA 5737162660</strong> a.n SAEPUL IMAN</p>
    </div>
    
    <div class="footer">
      <p class="hormat-kami">Hormat Kami</p>
      <div class="signature-space"></div>
      <p>Berkah Maju Elektrik</p>
    </div>
  </div>
</body>
</html>`;
};

export const buildSuratJalanHTML = (items: InvoiceItem[]): string => {
  const rows = items.map((item, index) => {
    const prefix = item.tipe === '-' ? '' : 'UPS';
    const tipeStr = item.tipe === '-' ? '' : item.tipe;
    const autoSj = [prefix, tipeStr, item.note].filter(Boolean).join(' ');
    const ket = item.sjKeterangan || autoSj;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name || ''}</td>
        <td>${item.qty} ${item.qtyUnit || 'pcs'}</td>
        <td>${ket.trim().replace(/\n/g, '<br>')}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Jalan - Berkah Maju Elektrik</title>
  <style>
${SURAT_JALAN_STYLE}
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header-container">
      <div class="company-info">
        <img src="/assets/icons/logo-bme.png" alt="Logo" class="company-logo" onerror="this.src='https://qydhvqhkmmrfizawfgvx.supabase.co/storage/v1/object/public/icons/logo-bme.png';">
        <div class="company-details">
          <h2>BERKAH MAJU ELEKTRIK</h2>
          <p>Jl. Raya Karehkel, Parung Panjang Atas Leuwiliang, Bogor</p>
          <p>0855-9174-9020 / 0853-1212-2030</p>
          <p>Sales dan Service Alat-alat Listrik, UPS, Stabilizer, Battery UPS</p>
        </div>
      </div>
      <div class="document-title">
        <div class="vertical-bar"></div>
        <h1>SURAT JALAN</h1>
      </div>
    </div>
    <div class="header-underline"></div>

    <div class="content-info">
      <div class="recipient-info">
        <p>Kepada Yth.</p>
        <p><strong>PT. Saraswanti Indo Genetech</strong></p>
        <p>Jl. Rasamala, Jl. Ring Road Yasmin No. 20,</p>
        <p>RT.02/RW.03, Curugmekar,</p>
        <p>Kec. Bogor Barat</p>
        <p>Kota Bogor 16113</p>
      </div>
      <div class="date-info">
        <p>Tanggal : .....................................</p>
      </div>
    </div>

    <div class="opening-text">
      <p>Bersama dengan ini kami kirimkan sejumlah barang sebagai berikut:</p>
    </div>
   
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Nama Barang</th>
          <th>Jumlah</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
${rows}
      </tbody>
    </table>
    
    <div class="received-date">
      <p>Diterima Tanggal : .....................................</p>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <p>Penerima</p>
        <div class="signature-space"></div>
        <p>(.....................................)</p>
      </div>
      <div class="signature-box">
        <p>Pengirim</p>
        <div class="signature-space"></div>
        <p>(.....................................)</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
