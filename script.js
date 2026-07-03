(function () {
  'use strict';

  /* ---------------- Theme toggle ---------------- */
  const toggleBtn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function renderToggleIcon() {
    toggleBtn.innerHTML = theme === 'dark'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    toggleBtn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  renderToggleIcon();
  toggleBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    renderToggleIcon();
  });

  /* ---------------- Mobile menu ---------------- */
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.toc a').forEach((a) => {
    a.addEventListener('click', () => {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- TOC scroll-spy ---------------- */
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const tocLinks = Array.from(document.querySelectorAll('.toc a[data-toc]'));
  const linkMap = new Map(tocLinks.map((l) => [l.getAttribute('href').slice(1), l]));

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = linkMap.get(id);
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- Sidebar filter ---------------- */
  const filterInput = document.getElementById('filterInput');
  filterInput.addEventListener('input', () => {
    const q = filterInput.value.trim().toLowerCase();
    document.querySelectorAll('#tocList > li').forEach((li) => {
      const text = li.textContent.toLowerCase();
      li.classList.toggle('hidden', q.length > 0 && !text.includes(q));
    });
  });

  /* ---------------- Code breakdown hover/click ---------------- */
  document.querySelectorAll('.code-breakdown').forEach((block) => {
    const segs = block.querySelectorAll('.seg');
    const legendItems = block.querySelectorAll('.legend-item');
    function setActive(part) {
      segs.forEach((s) => s.classList.toggle('hi', part && s.dataset.part === part));
      legendItems.forEach((l) => l.classList.toggle('active', part && l.dataset.target === part));
    }
    legendItems.forEach((item) => {
      item.addEventListener('mouseenter', () => setActive(item.dataset.target));
      item.addEventListener('mouseleave', () => setActive(null));
      item.addEventListener('focus', () => setActive(item.dataset.target));
      item.addEventListener('blur', () => setActive(null));
      item.addEventListener('click', () => setActive(item.dataset.target));
    });
    segs.forEach((seg) => {
      seg.addEventListener('mouseenter', () => setActive(seg.dataset.part));
      seg.addEventListener('mouseleave', () => setActive(null));
    });
  });

  /* ---------------- Toast ---------------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------------- ISRC validator ---------------- */
  const isrcInput = document.getElementById('isrcInput');
  const isrcResult = document.getElementById('isrcResult');
  const isrcBtn = document.getElementById('isrcCheck');

  function checkIsrc() {
    const raw = isrcInput.value.trim().toUpperCase().replace(/[\s-]/g, '');
    isrcResult.classList.remove('valid', 'invalid');
    if (!raw) { isrcResult.textContent = ''; return; }
    const re = /^([A-Z]{2})([A-Z0-9]{3})(\d{2})(\d{5})$/;
    const m = raw.match(re);
    if (!m) {
      isrcResult.textContent = '✕ Not a valid ISRC. Expected 12 characters: 2-letter country, 3-char registrant, 2-digit year, 5-digit designation.';
      isrcResult.classList.add('invalid');
      return;
    }
    const [, cc, reg, yy, des] = m;
    isrcResult.textContent = `✓ Valid format — Country: ${cc} · Registrant: ${reg} · Year: 20${yy} · Designation: ${des}`;
    isrcResult.classList.add('valid');
  }
  isrcBtn.addEventListener('click', checkIsrc);
  isrcInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkIsrc(); });

  /* ---------------- UPC/EAN checksum validator ---------------- */
  const upcInput = document.getElementById('upcInput');
  const upcResult = document.getElementById('upcResult');
  const upcBtn = document.getElementById('upcCheck');

  function gtinChecksumValid(digits) {
    // digits: array of numbers, last is check digit. Works for 8/12/13/14-digit GTINs.
    const check = digits[digits.length - 1];
    const body = digits.slice(0, -1);
    let sum = 0;
    // Multiply alternating from the right: 3,1,3,1... starting with the digit immediately left of check digit = weight 3
    const reversedBody = body.slice().reverse();
    reversedBody.forEach((d, i) => {
      sum += d * (i % 2 === 0 ? 3 : 1);
    });
    const calcCheck = (10 - (sum % 10)) % 10;
    return calcCheck === check;
  }

  function checkUpc() {
    const raw = upcInput.value.trim().replace(/[\s-]/g, '');
    upcResult.classList.remove('valid', 'invalid');
    if (!raw) { upcResult.textContent = ''; return; }
    if (!/^\d{12,13}$/.test(raw)) {
      upcResult.textContent = '✕ Enter a 12-digit UPC (GTIN-12) or 13-digit EAN.';
      upcResult.classList.add('invalid');
      return;
    }
    const digits = raw.split('').map(Number);
    const valid = gtinChecksumValid(digits);
    const kind = raw.length === 12 ? 'UPC (GTIN-12)' : 'EAN-13';
    if (valid) {
      upcResult.textContent = `✓ Valid ${kind} checksum.`;
      upcResult.classList.add('valid');
    } else {
      upcResult.textContent = `✕ Checksum failed for a ${kind} — check digit does not match.`;
      upcResult.classList.add('invalid');
    }
  }
  upcBtn.addEventListener('click', checkUpc);
  upcInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkUpc(); });

  /* ---------------- CSV template download ---------------- */
  document.getElementById('downloadCsv').addEventListener('click', () => {
    const headers = [
      'Track Title', 'Version', 'Main Artist', 'Featured Artists', 'Writer/Composer',
      'Producer', 'Publisher', 'PRO Affiliation', 'Language', 'Explicit (Y/N)', 'Genre',
      'Recording Date', 'ISRC', 'Release Title', 'Release Type', 'UPC/EAN', 'Release Date', 'Label', 'Rights Splits'
    ];
    const sample = [
      'Song Title (Radio Edit)', 'Radio Edit', 'Artist Name', '', 'Jane Writer',
      'Producer Name', 'Publisher Name', 'ASCAP', 'English', 'N', 'Alternative',
      '2026-01-15', 'US-XXX-26-00001', 'Album Title', 'Album', '072345678901', '2026-03-01', 'Label Name', 'Artist 50% / Writer 50%'
    ];
    const csv = [headers.join(','), sample.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalog_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('catalog_template.csv downloaded');
  });

  /* ---------------- Print button ---------------- */
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  /* ---------------- Sources list ---------------- */
  const sources = [
    ['https://isrc.ifpi.org', 'isrc.ifpi.org'],
    ['https://support.landr.com/hc/en-us/articles/204177690-What-are-ISRC-and-UPC-codes', 'LANDR — What are ISRC and UPC codes'],
    ['https://soundcharts.com/blog/what-is-a-upc', 'Soundcharts — What is a UPC'],
    ['https://en.wikipedia.org/wiki/International_Standard_Recording_Code', 'Wikipedia — ISRC'],
    ['https://www.masterdisk.com/post/blog_isrc-codes', 'Masterdisk — ISRC Codes'],
    ['https://support.cdbaby.com/hc/en-us/articles/360019038511-Understanding-ISRCs', 'CD Baby — Understanding ISRCs'],
    ['https://www.soundexchange.com/2024/01/09/all-about-isrcs/', 'SoundExchange — All About ISRCs'],
    ['https://soundcharts.com/blog/what-is-an-isrc', 'Soundcharts — What is an ISRC'],
    ['https://isrc.ifpi.org/get-isrc', 'IFPI — Get ISRC'],
    ['https://isrc.ifpi.org/isrc-standard/isrc-agencies', 'IFPI — ISRC Agencies'],
    ['https://isrc.ifpi.org/contacts/isrc-agency-contacts', 'IFPI — ISRC Agency Contacts'],
    ['https://isrc.ifpi.org/images/downloads/Valid_Characters_in_the_ISRC_Prefix.pdf', 'IFPI — Valid Characters in the ISRC Prefix (PDF)'],
    ['https://usisrc.org/how-it-works/', 'US ISRC Agency — How It Works'],
    ['https://www.lalal.ai/blog/what-is-an-isrc-code-how-to-get-one/', 'LALAL.AI — What is an ISRC Code'],
    ['https://info.xposuremusic.com/article/what-is-an-isrc-code-and-why-do-you-need-one', 'Xposure Music — What is an ISRC Code'],
    ['https://blog.songtrust.com/isrc-iswc-song-registration-tips', 'Songtrust — ISRC/ISWC Song Registration Tips'],
    ['https://blog.discmakers.com/2025/01/isrc-vs-iswc/', 'Disc Makers — ISRC vs ISWC'],
    ['https://www.tunecore.com/guides/all-you-need-to-know-about-isrc-codes', 'TuneCore — All You Need to Know About ISRC Codes'],
    ['https://support.distrokid.com/hc/en-us/articles/360013649173-Getting-ISRCs-From-DistroKid', 'DistroKid — Getting ISRCs From DistroKid'],
    ['https://support.duplication.cdbaby.com/hc/en-us/articles/205397198-How-do-I-assign-ISRC-codes-to-my-music', 'CD Baby Duplication — Assigning ISRC Codes'],
    ['https://support.tunecore.com/hc/en-us/articles/115006499567-TuneCore-UPCs-and-ISRCs', 'TuneCore — UPCs and ISRCs'],
    ['https://support.distrokid.com/hc/en-us/sections/360002755154-ISRC-UPC', 'DistroKid — ISRC/UPC Support Section'],
    ['https://www.barcode-us.info/identifiers-for-music-irsc-and-upc/', 'Barcode-US — Identifiers for Music: ISRC and UPC'],
    ['https://www.otherrecordlabels.com/isrc', 'Other Record Labels — ISRC'],
    ['https://www.barcode.graphics/music-industry-identifiers-upc-vs-isrc/', 'Barcode Graphics — Music Industry Identifiers: UPC vs ISRC'],
    ['https://www.blankmediaprinting.com/blog-article/what-is-a-upc-code-for-music', 'Blank Media Printing — What is a UPC Code for Music'],
    ['https://blog.discmakers.com/2023/07/upc-codes-for-music/', 'Disc Makers — UPC Codes for Music'],
    ['https://timly.com/en/what-is-a-upc-code-number-product-barcode/', 'Timly — What is a UPC Code/Product Barcode'],
    ['https://www.chromamastering.com/isrc-upc-codes/', 'Chroma Mastering — ISRC & UPC Codes'],
    ['https://www.gs1us.org/upcs-barcodes-prefixes', 'GS1 US — UPCs, Barcodes & Prefixes'],
    ['https://www.gs1us.org', 'GS1 US'],
    ['https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode', 'GS1 US — How to Get a UPC Barcode'],
    ['https://store.gs1us.org/gs1-company-prefix/p', 'GS1 US Store — Company Prefix'],
    ['https://www.barcode-us.info/how-many-upcs/', 'Barcode-US — How Many UPCs'],
    ['https://www.barcode-us.com/gtins-prefixes-barcodes/gs1-barcode-service-pricing', 'Barcode-US — GS1 Barcode Service Pricing'],
    ['https://www.barcode.graphics/gs1-upc-barcode-services/', 'Barcode Graphics — GS1 UPC Barcode Services'],
    ['https://www.barcodestalk.com/buy-barcodes', 'Barcodes Talk — Buy Barcodes'],
    ['https://www.mybarcodestore.com', 'My Barcode Store'],
    ['https://www.simplybarcodes.com/barcode-north-america.html', 'Simply Barcodes — Barcode North America'],
    ['https://www.isrcfinder.com/upc-finder/', 'ISRC Finder — UPC Finder'],
    ['https://soundcharts.com/blog/music-metadata', 'Soundcharts — Music Metadata'],
    ['https://kb.ddex.net/about-ddex-standards/which-standard-do-i-need/ddex-for-distributors', 'DDEX Knowledge Base — DDEX for Distributors'],
    ['https://ddex.net/standards/musical-works-data-and-rights-communication/', 'DDEX — Musical Works Data and Rights Communication'],
    ['https://kb.ddex.net/about-ddex-standards/ddex-standards', 'DDEX Knowledge Base — DDEX Standards'],
    ['https://help.songtrust.com/knowledge/everything-you-need-to-know-about-isrc-codes', 'Songtrust — Everything You Need to Know About ISRC Codes'],
    ['https://www.sageaudio.com/articles/isrc-codes-explained', 'Sage Audio — ISRC Codes Explained'],
    ['https://www.musicguymixing.com/how-to-get-a-upc-code-for-music/', 'Music Guy Mixing — How to Get a UPC Code for Music'],
  ];

  const sourcesList = document.getElementById('sourcesList');
  sources.forEach(([url, label], i) => {
    const li = document.createElement('li');
    li.id = `src-${i + 1}`;
    li.innerHTML = `<span class="src-num">${i + 1}.</span><a href="${url}" target="_blank" rel="noopener">${label}</a>`;
    sourcesList.appendChild(li);
  });
})();
