/* ============================================
   SKARDU ELITE TRAVEL — Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Theme Toggle (Dark / Light) ---
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  // Load saved theme or detect system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Apply on load
  applyTheme(getPreferredTheme());

  // Toggle on click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // --- Navbar Scroll Effect (throttled with rAF) ---
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // --- Mobile Nav Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  function closeMobileNav() {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navOverlay.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- Fleet Filter Tabs + Feature Filters ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const carCards = document.querySelectorAll('.car-card');
  const featureChips = document.querySelectorAll('.feature-chip');
  const clearFeaturesBtn = document.getElementById('clearFeatures');
  const fleetGrid = document.querySelector('.fleet-grid');

  let activeCategory = 'all';
  let activeFeatures = new Set();

  function applyFilters() {
    let visibleCount = 0;

    carCards.forEach(card => {
      const cardCategory = card.dataset.category;
      const cardFeatures = (card.dataset.features || '').split(',');

      // Check category match
      const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;

      // Check feature match — card must have ALL active features
      let featureMatch = true;
      activeFeatures.forEach(f => {
        if (!cardFeatures.includes(f)) featureMatch = false;
      });

      if (categoryMatch && featureMatch) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show no-results message
    const existing = fleetGrid.querySelector('.fleet-no-results');
    if (existing) existing.remove();

    if (visibleCount === 0) {
      const msg = document.createElement('div');
      msg.className = 'fleet-no-results';
      msg.innerHTML = '<span>🔍</span>No cars match your filters.<br>Try removing some filters.';
      fleetGrid.appendChild(msg);
    }
  }

  // Category tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  // Feature chips (toggle)
  featureChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const feature = chip.dataset.feature;
      chip.classList.toggle('active');
      if (activeFeatures.has(feature)) {
        activeFeatures.delete(feature);
      } else {
        activeFeatures.add(feature);
      }
      applyFilters();
    });
  });

  // Clear all features
  if (clearFeaturesBtn) {
    clearFeaturesBtn.addEventListener('click', () => {
      activeFeatures.clear();
      featureChips.forEach(c => c.classList.remove('active'));
      applyFilters();
    });
  }

  // Shared helper for hero search
  function filterFleet(category) {
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === category));
    activeCategory = category;
    applyFilters();
  }

  // --- Hero Search Button ---
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const heroPickup = document.getElementById('heroPickup');
  const heroDropoff = document.getElementById('heroDropoff');

  // Set min dates
  if (heroPickup) {
    const today = new Date().toISOString().split('T')[0];
    heroPickup.min = today;
    if (heroDropoff) heroDropoff.min = today;
    heroPickup.addEventListener('change', () => {
      if (heroDropoff) heroDropoff.min = heroPickup.value;
    });
  }

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      const carType = document.getElementById('heroCarType')?.value || 'all';
      filterFleet(carType);
      document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // --- Hero Service Tabs ---
  const heroTabs = document.querySelectorAll('.hero-tab');
  const heroSearchRow = document.querySelector('.hero-search-row');

  heroTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      heroTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;

      if (tabName === 'cars') {
        // Show car search fields
        heroSearchRow.innerHTML = `
          <div class="search-field">
            <label>Pickup Location</label>
            <select id="heroLocation">
              <option value="airport">Skardu Airport (SDA)</option>
              <option value="office">Hussainabad Road Office</option>
              <option value="hotel">Hotel Delivery</option>
            </select>
          </div>
          <div class="search-field">
            <label>Pickup Date</label>
            <input type="date" id="heroPickup" />
          </div>
          <div class="search-field">
            <label>Drop-off Date</label>
            <input type="date" id="heroDropoff" />
          </div>
          <div class="search-field">
            <label>Car Type</label>
            <select id="heroCarType">
              <option value="all">All Types</option>
              <option value="suv">SUV</option>
              <option value="4x4">4x4 Jeep</option>
              <option value="sedan">Sedan</option>
              <option value="luxury">Luxury</option>
              <option value="van">Van</option>
            </select>
          </div>
          <button class="hero-search-btn" onclick="document.getElementById('fleet')?.scrollIntoView({behavior:'smooth'})">🔍 Search</button>
        `;
      } else if (tabName === 'flights') {
        heroSearchRow.innerHTML = `
          <div class="search-field">
            <label>From</label>
            <input type="text" id="flightFrom" placeholder="Islamabad (ISB)" />
          </div>
          <div class="search-field">
            <label>To</label>
            <input type="text" placeholder="Skardu (SDA)" value="Skardu (SDA)" readonly />
          </div>
          <div class="search-field">
            <label>Departure</label>
            <input type="date" id="flightDate" />
          </div>
          <div class="search-field">
            <label>Passengers</label>
            <select id="flightPassengers"><option value="1">1 Adult</option><option value="2">2 Adults</option><option value="3">3 Adults</option><option value="4">4 Adults</option></select>
          </div>
          <button class="hero-search-btn" id="flightSearchBtn">🔍 Search</button>
        `;

        // Set min date to today
        const flightDateInput = document.getElementById('flightDate');
        if (flightDateInput) {
          flightDateInput.min = new Date().toISOString().split('T')[0];
        }

        // Attach flight search handler
        document.getElementById('flightSearchBtn').addEventListener('click', () => {
          const from = document.getElementById('flightFrom').value.trim() || 'Islamabad';
          const dateVal = document.getElementById('flightDate').value;
          const passengers = document.getElementById('flightPassengers').value;

          // Build Google Flights search URL
          let url = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(from)}+to+Skardu`;
          if (dateVal) {
            url += `&d=${dateVal}`;
          }
          if (passengers) {
            url += `&px=${passengers}`;
          }

          window.open(url, '_blank');
        });
      } else if (tabName === 'stays') {
        heroSearchRow.innerHTML = `
          <div class="stays-map-search">
            <div class="stays-map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d52000!2d75.55!3d35.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1shotels+in+skardu!5e0!3m2!1sen!2s!4v1700000000000"
                width="100%"
                height="100%"
                style="border:0;border-radius:10px;"
                allowfullscreen=""
                loading="lazy"
                title="Skardu Hotels Map">
              </iframe>
              <div class="stays-map-badge">📍 Search on Map</div>
            </div>
            <div class="stays-hotel-list">
              <div class="stays-search-bar">
                <input type="text" placeholder="Search hotels in Skardu..." class="stays-input" />
              </div>
              <div class="stays-hotels-scroll">
                <div class="stays-hotel-card" onclick="window.open('https://maps.google.com/?q=Shangrila+Resort+Skardu','_blank')">
                  <div class="stays-hotel-img">🏨</div>
                  <div class="stays-hotel-info">
                    <h4>Shangrila Resort</h4>
                    <div class="stays-hotel-rating">⭐⭐⭐⭐⭐ <span>4.8</span></div>
                    <p>Lower Kachura Lake, Skardu</p>
                    <div class="stays-hotel-price">PKR 15,000<small>/night</small></div>
                  </div>
                </div>
                <div class="stays-hotel-card" onclick="window.open('https://maps.google.com/?q=Serena+Hotel+Skardu','_blank')">
                  <div class="stays-hotel-img">🏩</div>
                  <div class="stays-hotel-info">
                    <h4>Serena Hotel Skardu</h4>
                    <div class="stays-hotel-rating">⭐⭐⭐⭐⭐ <span>4.7</span></div>
                    <p>Yadgar Chowk, Skardu</p>
                    <div class="stays-hotel-price">PKR 22,000<small>/night</small></div>
                  </div>
                </div>
                <div class="stays-hotel-card" onclick="window.open('https://maps.google.com/?q=Concordia+Motel+Skardu','_blank')">
                  <div class="stays-hotel-img">🏠</div>
                  <div class="stays-hotel-info">
                    <h4>Concordia Motel</h4>
                    <div class="stays-hotel-rating">⭐⭐⭐⭐ <span>4.4</span></div>
                    <p>Hussainabad Road, Skardu</p>
                    <div class="stays-hotel-price">PKR 8,000<small>/night</small></div>
                  </div>
                </div>
                <div class="stays-hotel-card" onclick="window.open('https://maps.google.com/?q=Mashabrum+Hotel+Skardu','_blank')">
                  <div class="stays-hotel-img">🏔️</div>
                  <div class="stays-hotel-info">
                    <h4>Mashabrum Hotel</h4>
                    <div class="stays-hotel-rating">⭐⭐⭐⭐ <span>4.3</span></div>
                    <p>Near Airport, Skardu</p>
                    <div class="stays-hotel-price">PKR 6,500<small>/night</small></div>
                  </div>
                </div>
                <div class="stays-hotel-card" onclick="window.open('https://maps.google.com/?q=K2+Motel+Skardu','_blank')">
                  <div class="stays-hotel-img">⛰️</div>
                  <div class="stays-hotel-info">
                    <h4>K2 Motel</h4>
                    <div class="stays-hotel-rating">⭐⭐⭐⭐ <span>4.2</span></div>
                    <p>College Road, Skardu</p>
                    <div class="stays-hotel-price">PKR 5,000<small>/night</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (tabName === 'packages') {
        heroSearchRow.innerHTML = `
          <div class="search-field">
            <label>Tour Package</label>
            <select>
              <option>Skardu 5-Day Explorer</option>
              <option>Deosai & Shangrila Tour</option>
              <option>Hunza-Skardu Circuit</option>
              <option>K2 Base Camp Trek</option>
            </select>
          </div>
          <div class="search-field">
            <label>Start Date</label>
            <input type="date" />
          </div>
          <div class="search-field">
            <label>Travelers</label>
            <select><option>1 Person</option><option>2 People</option><option>3 People</option><option>4+ People</option></select>
          </div>
          <div class="search-field">
            <label>Budget</label>
            <select><option>Any Budget</option><option>Under PKR 50K</option><option>PKR 50K - 100K</option><option>PKR 100K+</option></select>
          </div>
          <button class="hero-search-btn">🔍 Search</button>
        `;
      } else if (tabName === 'cruises') {
        heroSearchRow.innerHTML = `
          <div class="search-field">
            <label>Lake / River</label>
            <select>
              <option>Shangrila Lake (Lower Kachura)</option>
              <option>Upper Kachura Lake</option>
              <option>Satpara Lake</option>
              <option>Indus River Rafting</option>
            </select>
          </div>
          <div class="search-field">
            <label>Date</label>
            <input type="date" />
          </div>
          <div class="search-field">
            <label>Group Size</label>
            <select><option>1-2 People</option><option>3-5 People</option><option>6-10 People</option><option>10+ People</option></select>
          </div>
          <div class="search-field">
            <label>Activity</label>
            <select><option>Boat Ride</option><option>Kayaking</option><option>Rafting</option><option>Full Day Tour</option></select>
          </div>
          <button class="hero-search-btn">🔍 Search</button>
        `;
      }
    });
  });

  // --- Testimonial Carousel ---
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  const totalSlides = dots.length;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  // Auto-advance testimonials
  setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, 6000);

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      // Skip bare '#' links (logo, social icons, etc.)
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Back to Top ---
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Booking Form (AJAX — no redirect) ---
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.querySelector('#name').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const carType = form.querySelector('#carType').value;
      const pickup = form.querySelector('#pickup').value;

      if (!name || !phone || !carType || !pickup) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
      }

      const submitBtn = form.querySelector('.form-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Submitting...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          showSuccessToast('🎉 Thanks for booking!', 'We\'ll get back to you within 30 minutes.');
        } else {
          showFormMessage('Something went wrong. Please try again or contact us on WhatsApp.', 'error');
        }
      } catch (err) {
        showFormMessage('Network error. Please check your connection and try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showFormMessage(text, type) {
    let msg = document.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.classList.add('form-message');
      if (form) form.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.cssText = `
      margin-top: 16px;
      padding: 14px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      animation: fadeInUp 0.4s ease;
      background: ${type === 'success' ? 'rgba(34,211,170,0.15)' : 'rgba(239,68,68,0.15)'};
      color: ${type === 'success' ? '#22d3aa' : '#ef4444'};
      border: 1px solid ${type === 'success' ? 'rgba(34,211,170,0.3)' : 'rgba(239,68,68,0.3)'};
    `;

    setTimeout(() => msg.remove(), 5000);
  }

  // --- Success Toast Popup ---
  function showSuccessToast(title, subtitle) {
    // Remove any existing toast
    const existing = document.querySelector('.success-toast-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'success-toast-overlay';
    overlay.innerHTML = `
      <div class="success-toast">
        <div class="success-toast-icon">✅</div>
        <h3 class="success-toast-title">${title}</h3>
        <p class="success-toast-subtitle">${subtitle}</p>
        <button class="success-toast-btn" onclick="this.closest('.success-toast-overlay').remove()">OK, Got it!</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
    }, 8000);
  }

  // --- Counter Animation for Stats ---
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  function animateCounter(el, target, suffix) {
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.innerHTML = current + '<span>' + suffix + '</span>';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- WhatsApp Floating Button ---
  const whatsappBtn = document.getElementById('whatsappBtn');
  const whatsappPopup = document.getElementById('whatsappPopup');
  const whatsappClose = document.getElementById('whatsappClose');

  if (whatsappBtn && whatsappPopup) {
    whatsappBtn.addEventListener('click', () => {
      whatsappPopup.classList.toggle('active');
    });

    if (whatsappClose) {
      whatsappClose.addEventListener('click', () => {
        whatsappPopup.classList.remove('active');
      });
    }

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      const floatContainer = document.getElementById('whatsappFloat');
      if (floatContainer && !floatContainer.contains(e.target)) {
        whatsappPopup.classList.remove('active');
      }
    });
  }

  // --- Booking Modal ---
  const bookingModal = document.getElementById('bookingModal');
  const bookingModalClose = document.getElementById('bookingModalClose');
  const modalCarImg = document.getElementById('modalCarImg');
  const modalCarName = document.getElementById('modalCarName');
  const modalCarCategory = document.getElementById('modalCarCategory');
  const modalCarFeatures = document.getElementById('modalCarFeatures');
  const modalCarPrice = document.getElementById('modalCarPrice');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
  const summaryCarName = document.getElementById('summaryCarName');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTotal = document.getElementById('summaryTotal');
  const modalPickup = document.getElementById('modalPickup');
  const modalDropoff = document.getElementById('modalDropoff');

  let currentCarDayPrice = 0;

  function openBookingModal(card) {
    // Extract car data from the card
    const img = card.querySelector('.car-photo');
    const name = card.querySelector('.car-card-name');
    const category = card.querySelector('.car-card-category');
    const features = card.querySelectorAll('.car-feature');
    const priceEl = card.querySelector('.car-price');

    // Set modal content
    if (img) modalCarImg.src = img.src;
    if (name) {
      modalCarName.textContent = name.textContent;
      summaryCarName.textContent = name.textContent;
    }
    if (category) modalCarCategory.textContent = category.textContent;

    // Set features
    modalCarFeatures.innerHTML = '';
    features.forEach(f => {
      const chip = document.createElement('span');
      chip.className = 'modal-feature';
      chip.textContent = f.textContent.trim();
      modalCarFeatures.appendChild(chip);
    });

    // Set price
    if (priceEl) {
      const priceText = priceEl.textContent.trim();
      const priceMatch = priceText.match(/PKR\s*([\d,]+)/);
      if (priceMatch) {
        const priceNum = priceMatch[1].replace(/,/g, '');
        currentCarDayPrice = parseInt(priceNum);
        modalCarPrice.textContent = 'PKR ' + parseInt(priceNum).toLocaleString();
      }
    }

    // Set WhatsApp link
    const carTitle = name ? name.textContent : 'a car';
    modalWhatsAppBtn.href = `https://wa.me/923463996608?text=${encodeURIComponent(
      `Assalam u Alaikum! I want to book ${carTitle} in Skardu. Please share availability and details.`
    )}`;

    // Set min dates
    const today = new Date().toISOString().split('T')[0];
    modalPickup.min = today;
    modalDropoff.min = today;

    // Reset price summary
    summaryDuration.textContent = 'Select dates';
    summaryTotal.textContent = '—';

    // Open modal
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach click to all "Book Now" buttons in car cards
  document.querySelectorAll('.car-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.car-card');
      if (card) openBookingModal(card);
    });
  });

  // Close modal
  if (bookingModalClose) {
    bookingModalClose.addEventListener('click', closeBookingModal);
  }

  // Close on overlay click
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
      closeBookingModal();
    }
  });

  // Calculate price when dates change
  function updatePriceSummary() {
    if (modalPickup.value && modalDropoff.value) {
      const pickup = new Date(modalPickup.value);
      const dropoff = new Date(modalDropoff.value);
      const diffTime = dropoff - pickup;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days > 0) {
        summaryDuration.textContent = days + (days === 1 ? ' day' : ' days');
        const total = days * currentCarDayPrice;
        summaryTotal.textContent = 'PKR ' + total.toLocaleString();
      } else {
        summaryDuration.textContent = 'Invalid dates';
        summaryTotal.textContent = '—';
      }
    }
  }

  if (modalPickup) modalPickup.addEventListener('change', () => {
    if (modalPickup.value) modalDropoff.min = modalPickup.value;
    updatePriceSummary();
  });
  if (modalDropoff) modalDropoff.addEventListener('change', updatePriceSummary);

  // Modal form submit (AJAX — no redirect)
  const modalBookingForm = document.getElementById('modalBookingForm');
  if (modalBookingForm) {
    modalBookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('modalName').value.trim();
      const phone = document.getElementById('modalPhone').value.trim();
      const pickup = modalPickup.value;
      const dropoff = modalDropoff.value;

      if (!name || !phone || !pickup || !dropoff) {
        alert('Please fill in all required fields.');
        return;
      }

      // Populate hidden fields with car info before submission
      const carNameEl = document.getElementById('modalCarName');
      const carPriceEl = document.getElementById('modalCarPrice');
      const carHidden = document.getElementById('modalCarHidden');
      const priceHidden = document.getElementById('modalPriceHidden');
      if (carHidden && carNameEl) carHidden.value = carNameEl.textContent;
      if (priceHidden && carPriceEl) priceHidden.value = carPriceEl.textContent + '/day';

      const submitBtn = modalBookingForm.querySelector('.booking-modal-submit-btn');
      let originalText = '';
      if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Submitting...';
        submitBtn.disabled = true;
      }

      try {
        const formData = new FormData(modalBookingForm);
        const response = await fetch(modalBookingForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          modalBookingForm.reset();
          closeBookingModal();
          showSuccessToast('🎉 Thanks for booking!', 'We\'ll confirm your reservation within minutes.');
        } else {
          alert('Something went wrong. Please try again or book via WhatsApp.');
        }
      } catch (err) {
        alert('Network error. Please check your connection and try again.');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }
  // --- Hotel Section Filters & Sort ---
  const hotelFilterPills = document.querySelectorAll('[data-hotel-filter]');
  const hotelSortPills = document.querySelectorAll('[data-hotel-sort]');
  const hotelCardsList = document.getElementById('hotelCardsList');
  const hotelCards = document.querySelectorAll('.hotel-card');
  let activeHotelFilter = 'all';

  function applyHotelFilter() {
    let visibleCount = 0;
    hotelCards.forEach(card => {
      const type = card.dataset.hotelType;
      const match = activeHotelFilter === 'all' || type === activeHotelFilter;
      if (match) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no results
    const existing = hotelCardsList?.querySelector('.hotel-no-results');
    if (existing) existing.remove();

    if (visibleCount === 0 && hotelCardsList) {
      const msg = document.createElement('div');
      msg.className = 'hotel-no-results';
      msg.innerHTML = '<span>🏨</span>No hotels match this filter.<br>Try a different category.';
      hotelCardsList.appendChild(msg);
    }
  }

  hotelFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      hotelFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeHotelFilter = pill.dataset.hotelFilter;
      applyHotelFilter();
    });
  });

  // Sort by price or rating
  hotelSortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Deactivate other sort pills first
      hotelSortPills.forEach(p => {
        if (p !== pill) p.classList.remove('active');
      });
      pill.classList.toggle('active');
      const sortBy = pill.dataset.hotelSort;

      if (!hotelCardsList) return;

      const cards = Array.from(hotelCards);
      cards.sort((a, b) => {
        const aVal = parseFloat(a.dataset[`hotel${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`]);
        const bVal = parseFloat(b.dataset[`hotel${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`]);
        if (sortBy === 'rating') return bVal - aVal; // highest first
        return aVal - bVal; // lowest first for price
      });

      cards.forEach(card => {
        hotelCardsList.appendChild(card);
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      });
    });
  });

});
