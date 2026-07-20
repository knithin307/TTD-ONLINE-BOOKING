// Application State
const state = {
    currentUser: null,
    bookings: [],
    currentTab: 'book', // book, history, rules
    currentStep: 1, // 1 to 6
    bookingConfig: {
        service: 'darshan', // darshan, accommodation_m, seva_k
        pricePerPerson: 300,
        date: null, // string YYYY-MM-DD
        timeSlot: null,
        pilgrims: [],
        extraLaddus: 0
    },
    simulatedOtp: '',
    paymentTimer: null,
    paymentSecondsLeft: 600,
    calendarDate: new Date() // Date object representing the currently viewed month
};

// Services definitions
const SERVICES = {
    'darshan': { name: 'Special Entry Darshan', price: 300, location: 'ATC Car Parking Area, Tirumala' },
    'accommodation_m': { name: 'Accommodation (Tirumala)', price: 500, location: 'CRO Office Counter, Tirumala' },
    'seva_k': { name: 'Kalyanotsavam (Seva)', price: 1000, location: 'Arjitham Office, Tirumala' }
};

// UI Elements
const els = {
    toastContainer: document.getElementById('toastContainer'),
    mainNav: document.getElementById('mainNav'),
    homeView: document.getElementById('homeView'),
    dashboardView: document.getElementById('dashboardView'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    userProfileArea: document.getElementById('userProfileArea'),
    headerLoginBtn: document.getElementById('headerLoginBtn'),
    
    // Sidebar Tabs
    sidebarLinks: document.querySelectorAll('.sidebar-link'),
    panes: document.querySelectorAll('.dashboard-pane'),
    
    // Login Modal
    loginModal: document.getElementById('loginModalOverlay'),
    loginClose: document.getElementById('loginModalCloseBtn'),
    loginForm: document.getElementById('loginForm'),
    loginMobile: document.getElementById('loginMobile'),
    loginSendOtpBtn: document.getElementById('loginSendOtpBtn'),
    loginOtpGroup: document.getElementById('loginOtpGroup'),
    loginOtp: document.getElementById('loginOtp'),
    loginCaptchaText: document.getElementById('loginCaptchaText'),
    loginCaptchaRefresh: document.getElementById('loginCaptchaRefreshBtn'),
    loginCaptchaInput: document.getElementById('loginCaptchaInput'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    switchToRegister: document.getElementById('switchToRegisterLink'),
    
    // Register Modal
    registerModal: document.getElementById('registerModalOverlay'),
    registerClose: document.getElementById('registerModalCloseBtn'),
    registerForm: document.getElementById('registerForm'),
    registerName: document.getElementById('regName'),
    registerAge: document.getElementById('regAge'),
    registerGender: document.getElementById('regGender'),
    registerMobile: document.getElementById('regMobile'),
    registerIdType: document.getElementById('regIdType'),
    registerIdNumber: document.getElementById('regIdNumber'),
    registerCaptchaText: document.getElementById('regCaptchaText'),
    registerCaptchaRefresh: document.getElementById('regCaptchaRefreshBtn'),
    registerCaptchaInput: document.getElementById('regCaptchaInput'),
    switchToLogin: document.getElementById('switchToLoginLink'),

    // Wizard
    wizardSteps: document.querySelectorAll('.wizard-step'),
    wizardProgressBar: document.getElementById('wizardProgressBar'),
    wizardPanes: document.querySelectorAll('.wizard-pane'),
    wizardPrevBtn: document.getElementById('wizardPrevBtn'),
    wizardNextBtn: document.getElementById('wizardNextBtn'),
    wizardNavControls: document.getElementById('wizardNavControls'),
    
    // Step 1: Services Selection
    quotaBoxes: document.querySelectorAll('.quota-box'),
    
    // Step 2: Calendar
    calendarMonthTitle: document.getElementById('calMonthYearTitle'),
    calendarGrid: document.getElementById('calendarGrid'),
    calPrevMonthBtn: document.getElementById('calPrevMonthBtn'),
    calNextMonthBtn: document.getElementById('calNextMonthBtn'),
    timeSlotsWrapper: document.getElementById('timeSlotsWrapper'),
    timeSlotsGrid: document.getElementById('timeSlotsGrid'),
    
    // Step 3: Pilgrims
    pilgrimsContainer: document.getElementById('pilgrimsContainer'),
    addPilgrimBtn: document.getElementById('addPilgrimBtn'),
    ladduMinusBtn: document.getElementById('ladduMinusBtn'),
    ladduPlusBtn: document.getElementById('ladduPlusBtn'),
    ladduCountDisplay: document.getElementById('ladduCountDisplay'),
    
    // Step 4: Summary
    summaryTableBody: document.getElementById('summaryTableBody'),
    
    // Step 5: Payment
    paymentOptionCards: document.querySelectorAll('.payment-option-card'),
    paymentLoadingOverlay: document.getElementById('paymentLoadingOverlay'),
    paymentLoadingText: document.getElementById('paymentLoadingText'),
    paymentCountdownTimer: document.getElementById('paymentCountdownTimer'),
    paymentTotalAmountDisplay: document.getElementById('paymentTotalAmountDisplay'),
    
    // Step 6: Ticket Receipt
    ticketReceiptCard: document.getElementById('ticketReceiptCard'),
    ticketHeaderService: document.getElementById('ticketHeaderService'),
    ticketRefNumber: document.getElementById('ticketRefNumber'),
    ticketBookingDateTime: document.getElementById('ticketBookingDateTime'),
    ticketServiceDate: document.getElementById('ticketServiceDate'),
    ticketReportingTime: document.getElementById('ticketReportingTime'),
    ticketAmountPaid: document.getElementById('ticketAmountPaid'),
    ticketPilgrimTable: document.getElementById('ticketPilgrimTable').querySelector('tbody'),
    ticketLadduAllocated: document.getElementById('ticketLadduAllocated'),
    ticketBarcodeText: document.getElementById('ticketBarcodeText'),
    ticketPrintBtn: document.getElementById('ticketPrintBtn'),
    ticketReturnBtn: document.getElementById('ticketReturnBtn'),
    
    // Dashboard views
    bookingHistoryList: document.getElementById('bookingHistoryListContainer')
};

/* ==========================================================================
   THEMING & UTILITIES
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem('ttd-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const sunIcon = els.themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = els.themeToggleBtn.querySelector('.moon-icon');
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

els.themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ttd-theme', newTheme);
    updateThemeIcon(newTheme);
});

// Toast Alert Helper
function showToast(title, desc, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    // Generate inline SVG based on toast type
    const iconSvg = type === 'success' 
        ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 24H2v-4h2v-8c0-4.07 2.24-7.63 6-8.71V3c0-1.1.9-2 2-2s2 .9 2 2v.29c3.76 1.15 6 4.68 6 8.71v8h2v4zm-10-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>`;

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;
    els.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5500);
}

// CAPTCHA Generator
function generateCaptcha(length = 5) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous letters O, I, 1, 0
    let captcha = '';
    for (let i = 0; i < length; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function refreshCaptcha(type) {
    const captchaText = generateCaptcha();
    if (type === 'login') {
        els.loginCaptchaText.textContent = captchaText;
        els.loginCaptchaInput.value = '';
    } else {
        els.regCaptchaText.textContent = captchaText;
        els.registerCaptchaInput.value = '';
    }
}

els.loginCaptchaRefresh.addEventListener('click', () => refreshCaptcha('login'));
els.registerCaptchaRefresh.addEventListener('click', () => refreshCaptcha('register'));

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

function switchView(viewId) {
    if (viewId === 'homeView') {
        els.homeView.style.display = 'block';
        els.dashboardView.style.display = 'none';
        
        document.querySelectorAll('.nav-link').forEach(link => {
            if(link.getAttribute('data-target') === 'homeView') link.classList.add('active');
            else link.classList.remove('active');
        });
    } else {
        els.homeView.style.display = 'none';
        els.dashboardView.style.display = 'block';
        els.dashboardView.classList.add('active');
    }
}

// Global Nav bar click events
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-target');
        const tab = link.getAttribute('data-tab');
        
        if (targetView === 'dashboardView') {
            if (!state.currentUser) {
                showToast('Authentication Required', 'Please log in to access booking services and account dashboard.', 'info');
                openModal('login');
                return;
            }
            switchView('dashboardView');
            if (tab) switchDashboardTab(tab);
        } else {
            switchView('homeView');
        }
    });
});

// Service Grid "Book Now" trigger buttons
document.querySelectorAll('.book-service-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
        const serviceCode = btn.getAttribute('data-service');
        if (!state.currentUser) {
            showToast('Authentication Required', 'Please log in to continue booking.', 'info');
            openModal('login');
            return;
        }
        switchView('dashboardView');
        switchDashboardTab('book');
        
        // Match selected service in wizard step 1
        let mappedCode = 'darshan';
        if (serviceCode === 'accommodation') mappedCode = 'accommodation_m';
        if (serviceCode === 'seva') mappedCode = 'seva_k';
        
        document.querySelectorAll('.quota-box').forEach(box => {
            if (box.getAttribute('data-service-code') === mappedCode) {
                box.click();
            }
        });
    });
});

// Sidebar link navigation inside Dashboard
function switchDashboardTab(tabName) {
    let paneId = 'paneBook';
    if (tabName === 'history') paneId = 'paneHistory';
    if (tabName === 'rules') paneId = 'paneRules';
    
    // Update active nav-link highlighting in header
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-tab') === tabName) link.classList.add('active');
        else link.classList.remove('active');
    });

    els.sidebarLinks.forEach(link => {
        if (link.getAttribute('data-pane') === paneId) link.classList.add('active');
        else link.classList.remove('active');
    });

    els.panes.forEach(pane => {
        if (pane.id === paneId) pane.classList.add('active');
        else pane.classList.remove('active');
    });

    state.currentTab = tabName;
    
    if (tabName === 'history') {
        renderBookingHistory();
    }
}

els.sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const paneId = link.getAttribute('data-pane');
        if (paneId) {
            let tab = 'book';
            if (paneId === 'paneHistory') tab = 'history';
            if (paneId === 'paneRules') tab = 'rules';
            switchDashboardTab(tab);
        }
    });
});

/* ==========================================================================
   AUTHENTICATION MODULE
   ========================================================================== */

function openModal(type) {
    if (type === 'login') {
        els.loginModal.classList.add('active');
        els.registerModal.classList.remove('active');
        refreshCaptcha('login');
        // Reset OTP fields
        els.loginOtpGroup.classList.remove('active');
        els.loginOtp.removeAttribute('required');
        els.loginSendOtpBtn.textContent = 'Send OTP';
    } else {
        els.registerModal.classList.add('active');
        els.loginModal.classList.remove('active');
        refreshCaptcha('register');
    }
}

function closeModal() {
    els.loginModal.classList.remove('active');
    els.registerModal.classList.remove('active');
}

els.headerLoginBtn.addEventListener('click', () => openModal('login'));
els.loginClose.addEventListener('click', closeModal);
els.registerClose.addEventListener('click', closeModal);
els.switchToRegister.addEventListener('click', (e) => { e.preventDefault(); openModal('register'); });
els.switchToLogin.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });

// Mock OTP Generator
els.loginSendOtpBtn.addEventListener('click', () => {
    const mobile = els.loginMobile.value.trim();
    if (mobile.length !== 10 || isNaN(mobile)) {
        showToast('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.', 'error');
        return;
    }
    
    // Generate mock 6 digit OTP code
    state.simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    els.loginOtpGroup.classList.add('active');
    els.loginOtp.setAttribute('required', 'true');
    els.loginSendOtpBtn.textContent = 'Resend OTP';
    
    // Trigger toast mimicking SMS received on mobile device
    setTimeout(() => {
        showToast(
            '💬 SMS Alert (Simulated)', 
            `Your OTP for logging in to TTD Devotional Portal is <b>${state.simulatedOtp}</b>. Valid for 10 minutes.`, 
            'default'
        );
    }, 1000);
});

// Login Handler
els.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mobile = els.loginMobile.value.trim();
    const otpInput = els.loginOtp.value.trim();
    const captchaInput = els.loginCaptchaInput.value.trim().toUpperCase();
    const captchaTarget = els.loginCaptchaText.textContent.trim().toUpperCase();
    
    if (captchaInput !== captchaTarget) {
        showToast('CAPTCHA Mismatch', 'The security characters entered do not match. Please try again.', 'error');
        refreshCaptcha('login');
        return;
    }

    if (!state.simulatedOtp || otpInput !== state.simulatedOtp) {
        showToast('Invalid OTP Code', 'The verification code entered is incorrect or expired.', 'error');
        return;
    }

    // Capture user profile. Check localStorage if user exists, else make a mock profile.
    let user = JSON.parse(localStorage.getItem(`user_${mobile}`));
    if (!user) {
        // Create a default profile
        user = {
            name: 'Devout Pilgrim',
            age: 35,
            gender: 'Male',
            mobile: mobile,
            idType: 'Aadhaar Card',
            idNumber: 'XXXX XXXX 1234'
        };
        localStorage.setItem(`user_${mobile}`, JSON.stringify(user));
    }
    
    loginUser(user);
    closeModal();
});

// Registration Handler
els.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const captchaInput = els.registerCaptchaInput.value.trim().toUpperCase();
    const captchaTarget = els.registerCaptchaText.textContent.trim().toUpperCase();
    
    if (captchaInput !== captchaTarget) {
        showToast('CAPTCHA Mismatch', 'The security characters entered do not match. Please try again.', 'error');
        refreshCaptcha('register');
        return;
    }

    const mobile = els.registerMobile.value.trim();
    if (mobile.length !== 10 || isNaN(mobile)) {
        showToast('Invalid Mobile', 'Mobile number must be exactly 10 digits.', 'error');
        return;
    }

    const user = {
        name: els.registerName.value.trim(),
        age: parseInt(els.registerAge.value),
        gender: els.registerGender.value,
        mobile: mobile,
        idType: els.registerIdType.value,
        idNumber: els.registerIdNumber.value.trim()
    };
    
    localStorage.setItem(`user_${mobile}`, JSON.stringify(user));
    showToast('Registration Successful', `Welcome, ${user.name}! Your account has been registered.`, 'success');
    loginUser(user);
    closeModal();
});

function loginUser(user) {
    state.currentUser = user;
    
    // Update Header profile area
    els.userProfileArea.innerHTML = `
        <div class="user-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            ${user.name.split(' ')[0]}
        </div>
    `;
    
    // Load bookings from local storage
    const stored = localStorage.getItem(`bookings_${user.mobile}`);
    state.bookings = stored ? JSON.parse(stored) : [];
    
    showToast('Login Successful', `Welcome back, ${user.name}. Session established.`, 'success');
    switchView('dashboardView');
    switchDashboardTab('book');
    resetBookingWizard();
}

// Logout Action
document.getElementById('sidebarLogoutBtn').addEventListener('click', () => {
    state.currentUser = null;
    state.bookings = [];
    els.userProfileArea.innerHTML = `
        <button class="auth-btn" id="headerLoginBtn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            Login / Register
        </button>
    `;
    // Rebind login modal opener since we replaced the element
    document.getElementById('headerLoginBtn').addEventListener('click', () => openModal('login'));
    
    showToast('Logged Out', 'You have been successfully logged out from the devotional portal.', 'info');
    switchView('homeView');
});

// Footer redirect binds
document.getElementById('footerLinkHome').addEventListener('click', (e) => { e.preventDefault(); switchView('homeView'); });
document.getElementById('footerLinkBook').addEventListener('click', (e) => { e.preventDefault(); els.navBookServices.click(); });
document.getElementById('footerLinkGuidelines').addEventListener('click', (e) => { e.preventDefault(); els.navRules.click(); });
document.getElementById('footerLinkInstructions').addEventListener('click', (e) => { e.preventDefault(); els.navRules.click(); });
document.getElementById('navBrandHome').addEventListener('click', (e) => { e.preventDefault(); switchView('homeView'); });

/* ==========================================================================
   BOOKING WIZARD ENGINE
   ========================================================================== */

function resetBookingWizard() {
    state.currentStep = 1;
    state.bookingConfig = {
        service: 'darshan',
        pricePerPerson: 300,
        date: null,
        timeSlot: null,
        pilgrims: [],
        extraLaddus: 0
    };
    els.ladduCountDisplay.textContent = '0';
    els.timeSlotsWrapper.classList.remove('active');
    
    // Reset service boxes selection UI
    els.quotaBoxes.forEach(box => {
        if(box.getAttribute('data-service-code') === 'darshan') box.classList.add('selected');
        else box.classList.remove('selected');
    });

    updateWizardSteps();
}

function updateWizardSteps() {
    // Enable/disable navigation buttons
    els.wizardNavControls.style.display = state.currentStep === 6 ? 'none' : 'flex';
    els.wizardPrevBtn.disabled = state.currentStep === 1;
    els.wizardNextBtn.textContent = state.currentStep === 5 ? 'Authorize Payment' : 'Next';
    
    // Disable next button on step 2 if no slot is selected
    if (state.currentStep === 2) {
        els.wizardNextBtn.disabled = !state.bookingConfig.date || !state.bookingConfig.timeSlot;
    } else {
        els.wizardNextBtn.disabled = false;
    }

    // Update progress tracker visual states
    els.wizardSteps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active', 'completed');
        if (stepNum === state.currentStep) {
            step.classList.add('active');
        } else if (stepNum < state.currentStep) {
            step.classList.add('completed');
        }
    });

    // Update progress bar width
    const percentage = ((state.currentStep - 1) / 5) * 100;
    els.wizardProgressBar.style.width = `${percentage}%`;

    // Toggle corresponding step panels
    els.wizardPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`wizardStep${state.currentStep}`).classList.add('active');

    // Run custom page initialization logic
    if (state.currentStep === 2) {
        renderCalendar();
    } else if (state.currentStep === 3) {
        initPilgrimStep();
    } else if (state.currentStep === 4) {
        renderSummaryStep();
    } else if (state.currentStep === 5) {
        startPaymentSession();
    }
}

// Step 1 Service Box Click Binding
els.quotaBoxes.forEach(box => {
    box.addEventListener('click', () => {
        els.quotaBoxes.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        
        const serviceCode = box.getAttribute('data-service-code');
        state.bookingConfig.service = serviceCode;
        
        if (serviceCode === 'darshan') state.bookingConfig.pricePerPerson = 300;
        else if (serviceCode === 'accommodation_m') state.bookingConfig.pricePerPerson = 500;
        else if (serviceCode === 'seva_k') state.bookingConfig.pricePerPerson = 1000;
        
        // Reset selected slots since service changed
        state.bookingConfig.date = null;
        state.bookingConfig.timeSlot = null;
    });
});

/* Wizard navigation events */
els.wizardNextBtn.addEventListener('click', () => {
    if (state.currentStep === 3) {
        if (!validatePilgrimsForms()) return;
    }
    
    if (state.currentStep < 6) {
        if (state.currentStep === 5) {
            processSimulatedPayment();
        } else {
            state.currentStep++;
            updateWizardSteps();
        }
    }
});

els.wizardPrevBtn.addEventListener('click', () => {
    if (state.currentStep > 1 && state.currentStep < 6) {
        state.currentStep--;
        updateWizardSteps();
    }
});

/* ==========================================================================
   STEP 2: CALENDAR AND TIME SLOTS
   ========================================================================== */

function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    
    const monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    els.calendarMonthTitle.textContent = `${monthsName[month]} ${year}`;
    
    // Clear old dates (keep weekday header labels)
    const headerCount = 7;
    while(els.calendarGrid.children.length > headerCount) {
        els.calendarGrid.removeChild(els.calendarGrid.lastChild);
    }
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Render blank empty days for offsets
    for (let i = 0; i < firstDayIndex; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell blocked';
        els.calendarGrid.appendChild(cell);
    }
    
    // Render month days
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        const currentCellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cellDate = new Date(year, month, day);
        
        let status = 'available';
        let slotsRemaining = 0;

        // Check if date is in the past
        const compareDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (cellDate < compareDate) {
            status = 'blocked';
        } else {
            // Determine slots count & availability based on a deterministic pseudo-random formula
            const randSeed = (day * 13 + month * 7 + year) % 100;
            if (randSeed < 15) {
                status = 'full';
                slotsRemaining = 0;
            } else if (randSeed < 30) {
                status = 'blocked'; // Closed quota
            } else {
                status = 'available';
                slotsRemaining = (randSeed * 5) + 12; // E.g., 87 to 512 slots left
            }
        }
        
        cell.className = `calendar-day-cell ${status}`;
        
        // Highlight if currently selected date
        if (state.bookingConfig.date === currentCellDateStr) {
            cell.classList.add('selected');
        }
        
        let slotText = '';
        if (status === 'available') slotText = `${slotsRemaining} Left`;
        else if (status === 'full') slotText = 'Sold Out';
        else slotText = 'Closed';

        cell.innerHTML = `
            <span class="calendar-day-number">${day}</span>
            <span class="calendar-slot-count">${slotText}</span>
        `;
        
        if (status === 'available') {
            cell.addEventListener('click', () => {
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                state.bookingConfig.date = currentCellDateStr;
                state.bookingConfig.timeSlot = null; // Reset slot
                
                showTimeSlots(currentCellDateStr);
                els.wizardNextBtn.disabled = true; // Disable Next until slot picked
            });
        }
        
        els.calendarGrid.appendChild(cell);
    }
}

// Calendar Navigation
els.calPrevMonthBtn.addEventListener('click', () => {
    // Don't navigate to months prior to current date
    const today = new Date();
    if (state.calendarDate.getFullYear() === today.getFullYear() && state.calendarDate.getMonth() <= today.getMonth()) {
        showToast('Invalid Navigation', 'Cannot view historical booking quotas.', 'error');
        return;
    }
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
    renderCalendar();
    els.timeSlotsWrapper.classList.remove('active');
});

els.calNextMonthBtn.addEventListener('click', () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
    renderCalendar();
    els.timeSlotsWrapper.classList.remove('active');
});

// Render reporting time slots
function showTimeSlots(dateStr) {
    els.timeSlotsWrapper.classList.add('active');
    els.timeSlotsGrid.innerHTML = '';
    
    const slots = [
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];
    
    // Seed availability randomly based on date
    const dateNum = parseInt(dateStr.replace(/-/g, ''));
    
    slots.forEach((slot, index) => {
        const btn = document.createElement('button');
        btn.className = 'time-slot-btn';
        
        const isFull = (dateNum + index) % 7 === 0;
        
        if (isFull) {
            btn.classList.add('disabled');
            btn.disabled = true;
            btn.innerHTML = `${slot}<br><span style="font-size:0.6rem; opacity:0.6;">Sold Out</span>`;
        } else {
            const leftCount = ((dateNum * (index + 2)) % 35) + 3;
            btn.innerHTML = `${slot}<br><span style="font-size:0.6rem; color:var(--success); font-weight:700;">${leftCount} slots</span>`;
            
            if (state.bookingConfig.timeSlot === slot) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.bookingConfig.timeSlot = slot;
                els.wizardNextBtn.disabled = false; // Enable wizard proceed
            });
        }
        els.timeSlotsGrid.appendChild(btn);
    });
}

/* ==========================================================================
   STEP 3: PILGRIM COMPONENT CREATION
   ========================================================================== */

function createPilgrimForm(index, isPrimary = false, prefillData = null) {
    const card = document.createElement('div');
    card.className = 'pilgrim-card';
    card.setAttribute('data-pilgrim-index', index);
    
    let deleteBtnHtml = '';
    if (!isPrimary) {
        deleteBtnHtml = `
            <button type="button" class="remove-pilgrim-btn" onclick="removePilgrimCard(${index})">
                ❌ Remove
            </button>
        `;
    }

    card.innerHTML = `
        <div class="pilgrim-card-header">
            <span class="pilgrim-title">${isPrimary ? 'Primary Pilgrim (Self)' : `Pilgrim #${index + 1}`}</span>
            ${deleteBtnHtml}
        </div>
        <div class="pilgrim-form-grid">
            <div class="form-group">
                <label>Name (Match ID card)</label>
                <input type="text" class="form-input pilgrim-name" value="${prefillData ? prefillData.name : ''}" placeholder="Enter full name" required>
            </div>
            <div class="form-group">
                <label>Age (Years)</label>
                <input type="number" class="form-input pilgrim-age" value="${prefillData ? prefillData.age : ''}" min="1" max="110" placeholder="Age" required>
            </div>
            <div class="form-group">
                <label>Gender</label>
                <select class="form-select pilgrim-gender" required>
                    <option value="" disabled ${!prefillData ? 'selected' : ''}>Select</option>
                    <option value="Male" ${prefillData && prefillData.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${prefillData && prefillData.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Transgender" ${prefillData && prefillData.gender === 'Transgender' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>ID Proof Type</label>
                <select class="form-select pilgrim-id-type" required>
                    <option value="" disabled ${!prefillData ? 'selected' : ''}>Select Card</option>
                    <option value="Aadhaar Card" ${prefillData && prefillData.idType === 'Aadhaar Card' ? 'selected' : ''}>Aadhaar Card</option>
                    <option value="Voter ID Card" ${prefillData && prefillData.idType === 'Voter ID Card' ? 'selected' : ''}>Voter ID</option>
                    <option value="Passport" ${prefillData && prefillData.idType === 'Passport' ? 'selected' : ''}>Passport</option>
                    <option value="PAN Card" ${prefillData && prefillData.idType === 'PAN Card' ? 'selected' : ''}>PAN Card</option>
                    <option value="Driving License" ${prefillData && prefillData.idType === 'Driving License' ? 'selected' : ''}>Driving License</option>
                </select>
            </div>
            <div class="form-group">
                <label>ID Number</label>
                <input type="text" class="form-input pilgrim-id-num" value="${prefillData ? prefillData.idNumber : ''}" placeholder="Enter card ID number" required>
            </div>
        </div>
    `;
    return card;
}

function initPilgrimStep() {
    els.pilgrimsContainer.innerHTML = '';
    
    // Check if pilgrims list is empty, default seed with logged-in user profile
    if (state.bookingConfig.pilgrims.length === 0 && state.currentUser) {
        state.bookingConfig.pilgrims.push({
            name: state.currentUser.name,
            age: state.currentUser.age,
            gender: state.currentUser.gender,
            idType: state.currentUser.idType,
            idNumber: state.currentUser.idNumber
        });
    }

    state.bookingConfig.pilgrims.forEach((pilgrim, idx) => {
        const card = createPilgrimForm(idx, idx === 0, pilgrim);
        els.pilgrimsContainer.appendChild(card);
    });
}

els.addPilgrimBtn.addEventListener('click', () => {
    const currentCount = els.pilgrimsContainer.children.length;
    if (currentCount >= 6) {
        showToast('Limit Reached', 'You can register a maximum of 6 pilgrims per transaction.', 'error');
        return;
    }
    const card = createPilgrimForm(currentCount, false);
    els.pilgrimsContainer.appendChild(card);
});

// Remove pilgrim handler
window.removePilgrimCard = function(index) {
    const card = els.pilgrimsContainer.querySelector(`[data-pilgrim-index="${index}"]`);
    if(card) {
        card.remove();
        // Recalculate index numbers on remaining children
        Array.from(els.pilgrimsContainer.children).forEach((child, newIdx) => {
            child.setAttribute('data-pilgrim-index', newIdx);
            const title = child.querySelector('.pilgrim-title');
            if (newIdx === 0) {
                title.textContent = 'Primary Pilgrim (Self)';
            } else {
                title.textContent = `Pilgrim #${newIdx + 1}`;
            }
            
            // Rewrite onclick mapping for remove buttons
            const removeBtn = child.querySelector('.remove-pilgrim-btn');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `removePilgrimCard(${newIdx})`);
            }
        });
    }
};

// Validate Pilgrim fields and compile into state bookingConfig
function validatePilgrimsForms() {
    const cards = els.pilgrimsContainer.querySelectorAll('.pilgrim-card');
    const tempPilgrims = [];
    let isValid = true;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const nameVal = card.querySelector('.pilgrim-name').value.trim();
        const ageVal = card.querySelector('.pilgrim-age').value.trim();
        const genderVal = card.querySelector('.pilgrim-gender').value;
        const idTypeVal = card.querySelector('.pilgrim-id-type').value;
        const idNumVal = card.querySelector('.pilgrim-id-num').value.trim();

        if (!nameVal || !ageVal || !genderVal || !idTypeVal || !idNumVal) {
            showToast('Incomplete Form', `Please fill out all fields for Pilgrim #${i + 1}.`, 'error');
            isValid = false;
            break;
        }

        const ageNum = parseInt(ageVal);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 110) {
            showToast('Invalid Age', `Please enter a valid age (1-110) for Pilgrim #${i + 1}.`, 'error');
            isValid = false;
            break;
        }

        // Perform mock ID length validations
        if (idTypeVal === 'Aadhaar Card' && (idNumVal.replace(/\s/g, '').length !== 12 || isNaN(idNumVal.replace(/\s/g, '')))) {
            showToast('Invalid Aadhaar', `Aadhaar card number must be exactly 12 numeric digits (Pilgrim #${i + 1}).`, 'error');
            isValid = false;
            break;
        }

        tempPilgrims.push({
            name: nameVal,
            age: ageNum,
            gender: genderVal,
            idType: idTypeVal,
            idNumber: idNumVal
        });
    }

    if (isValid) {
        state.bookingConfig.pilgrims = tempPilgrims;
    }
    return isValid;
}

// Laddu counter events
els.ladduPlusBtn.addEventListener('click', () => {
    state.bookingConfig.extraLaddus++;
    els.ladduCountDisplay.textContent = state.bookingConfig.extraLaddus;
});

els.ladduMinusBtn.addEventListener('click', () => {
    if (state.bookingConfig.extraLaddus > 0) {
        state.bookingConfig.extraLaddus--;
        els.ladduCountDisplay.textContent = state.bookingConfig.extraLaddus;
    }
});

/* ==========================================================================
   STEP 4: SUMMARY & BILLING
   ========================================================================== */

function renderSummaryStep() {
    const config = state.bookingConfig;
    const serviceDetails = SERVICES[config.service];
    
    const count = config.pilgrims.length;
    const ticketCost = serviceDetails.price * count;
    const ladduCost = config.extraLaddus * 50;
    const totalCost = ticketCost + ladduCost;
    
    // Format Date beautifully
    const d = new Date(config.date);
    const dateFormatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    els.summaryTableBody.innerHTML = `
        <tr>
            <td>
                <b>${serviceDetails.name}</b><br>
                <span style="font-size:0.8rem; color:var(--text-muted);">Reporting: ${dateFormatted} at ${config.timeSlot}</span>
            </td>
            <td style="text-align: right; vertical-align: middle;">₹${serviceDetails.price} &times; ${count} Person(s)</td>
            <td style="text-align: right; vertical-align: middle; font-weight:600;">₹${ticketCost.toFixed(2)}</td>
        </tr>
        <tr>
            <td>
                <b>Additional Laddus (Prasadams)</b><br>
                <span style="font-size:0.8rem; color:var(--text-muted);">All pilgrims receive 1 free laddu; extra laddus allocated.</span>
            </td>
            <td style="text-align: right; vertical-align: middle;">₹50 &times; ${config.extraLaddus} Laddu(s)</td>
            <td style="text-align: right; vertical-align: middle; font-weight:600;">₹${ladduCost.toFixed(2)}</td>
        </tr>
        <tr class="summary-total-row">
            <td colspan="2">Net Payable Amount</td>
            <td style="text-align: right;">₹${totalCost.toFixed(2)}</td>
        </tr>
    `;
}

/* ==========================================================================
   STEP 5: PAYMENT SIMULATOR
   ========================================================================== */

function startPaymentSession() {
    const serviceDetails = SERVICES[state.bookingConfig.service];
    const ticketCost = serviceDetails.price * state.bookingConfig.pilgrims.length;
    const ladduCost = state.bookingConfig.extraLaddus * 50;
    const totalCost = ticketCost + ladduCost;

    els.paymentTotalAmountDisplay.textContent = `₹${totalCost.toFixed(2)}`;
    
    // Reset payment overlay
    els.paymentLoadingOverlay.classList.remove('active');
    
    // Start countdown timer: 10 minutes
    state.paymentSecondsLeft = 600;
    clearInterval(state.paymentTimer);
    
    state.paymentTimer = setInterval(() => {
        state.paymentSecondsLeft--;
        
        const mins = Math.floor(state.paymentSecondsLeft / 60);
        const secs = state.paymentSecondsLeft % 60;
        els.paymentCountdownTimer.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        
        if (state.paymentSecondsLeft <= 0) {
            clearInterval(state.paymentTimer);
            showToast('Transaction Timeout', 'Your booking session has expired. Please select date slots again.', 'error');
            state.currentStep = 2;
            updateWizardSteps();
        }
    }, 1000);
}

// Gateway Option Card Toggle
els.paymentOptionCards.forEach(card => {
    card.addEventListener('click', () => {
        els.paymentOptionCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    });
});

// Process simulated steps with text triggers
function processSimulatedPayment() {
    clearInterval(state.paymentTimer);
    els.paymentLoadingOverlay.classList.add('active');
    
    const steps = [
        { text: "Contacting Secure Bank Gateway...", delay: 800 },
        { text: "Verifying Authentication Tokens...", delay: 1800 },
        { text: "Processing Payment Settlement...", delay: 2800 },
        { text: "Securing Booking Seat Quotas...", delay: 3800 },
        { text: "Success! Generating Digital Receipt...", delay: 4600 }
    ];
    
    steps.forEach(step => {
        setTimeout(() => {
            els.paymentLoadingText.textContent = step.text;
        }, step.delay);
    });

    // Complete transaction
    setTimeout(() => {
        const refNumber = 'TTD' + Math.floor(1000000000 + Math.random() * 9000000000);
        const bookingDate = new Date();
        const formattedBookingDate = bookingDate.toLocaleDateString() + ' ' + bookingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const serviceDetails = SERVICES[state.bookingConfig.service];
        const total = (serviceDetails.price * state.bookingConfig.pilgrims.length) + (state.bookingConfig.extraLaddus * 50);

        const newBooking = {
            id: refNumber,
            dateBooked: formattedBookingDate,
            serviceCode: state.bookingConfig.service,
            serviceName: serviceDetails.name,
            serviceDate: state.bookingConfig.date,
            timeSlot: state.bookingConfig.timeSlot,
            pilgrims: [...state.bookingConfig.pilgrims],
            extraLaddus: state.bookingConfig.extraLaddus,
            amount: total,
            status: 'Active'
        };
        
        // Save to active state and localStorage
        state.bookings.unshift(newBooking); // Add to beginning of history
        localStorage.setItem(`bookings_${state.currentUser.mobile}`, JSON.stringify(state.bookings));
        
        showToast('Payment Completed', 'Booking slots registered successfully.', 'success');
        
        // Advance to step 6 (Ticket)
        state.currentStep = 6;
        updateWizardSteps();
        
        // Render Ticket
        renderTicket(newBooking);
        
    }, 5200);
}

/* ==========================================================================
   STEP 6: TICKET RENDERER & EXPORTS
   ========================================================================== */

function renderTicket(booking) {
    const serviceDetails = SERVICES[booking.serviceCode] || { location: 'Tirumala Temple Entrance, Tirumala' };
    
    els.ticketHeaderService.textContent = `${booking.serviceName} Receipt`;
    els.ticketRefNumber.textContent = booking.id;
    els.ticketBookingDateTime.textContent = booking.dateBooked;
    
    // Format Date beautifully
    const d = new Date(booking.serviceDate);
    const dateFormatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    els.ticketServiceDate.textContent = dateFormatted;
    els.ticketReportingTime.textContent = booking.timeSlot;
    els.ticketAmountPaid.textContent = `₹${booking.amount.toFixed(2)} (Paid)`;
    els.ticketLadduAllocated.textContent = `${booking.pilgrims.length} Free + ${booking.extraLaddus} Additional`;
    
    // Random numbers under barcode
    const barcodeCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    els.ticketBarcodeText.textContent = barcodeCode;

    // Render Pilgrims list
    els.ticketPilgrimTable.innerHTML = '';
    booking.pilgrims.forEach(p => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #f3f4f6';
        row.innerHTML = `
            <td style="padding:0.6rem 0; font-weight:700;">${p.name}</td>
            <td style="padding:0.6rem 0;">${p.age} Yrs / ${p.gender}</td>
            <td style="padding:0.6rem 0;">${p.idType}</td>
            <td style="padding:0.6rem 0; font-family:monospace;">${p.idNumber}</td>
        `;
        els.ticketPilgrimTable.appendChild(row);
    });
}

// Print Handler
els.ticketPrintBtn.addEventListener('click', () => {
    window.print();
});

// Return to Dashboard Home
els.ticketReturnBtn.addEventListener('click', () => {
    resetBookingWizard();
    switchDashboardTab('book');
});

/* ==========================================================================
   BOOKING HISTORY COMPONENT
   ========================================================================== */

function renderBookingHistory() {
    els.bookingHistoryList.innerHTML = '';
    
    if (state.bookings.length === 0) {
        els.bookingHistoryList.innerHTML = `
            <div style="text-align:center; padding:3rem; color:var(--text-muted); font-size:1.1rem;">
                🚫 No historical bookings found for this account.
            </div>
        `;
        return;
    }
    
    state.bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        // Format Date beautifully
        const d = new Date(booking.serviceDate);
        const dateFormatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const isCancelled = booking.status === 'Cancelled';
        const cancelBtnHtml = isCancelled 
            ? '' 
            : `<button class="history-btn history-btn-cancel" onclick="cancelBooking('${booking.id}')">Cancel Booking</button>`;

        card.innerHTML = `
            <div class="history-info">
                <h5>${booking.serviceName} <span class="history-status-badge ${isCancelled ? 'cancelled' : 'active'}">${booking.status}</span></h5>
                <p style="margin-top:0.4rem;">
                    📆 Reporting: <b>${dateFormatted}</b> at <b>${booking.timeSlot}</b> | Cost: <b>₹${booking.amount.toFixed(2)}</b>
                </p>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                    Booking Ref: ${booking.id} | Booked On: ${booking.dateBooked}
                </p>
            </div>
            <div class="history-actions">
                <button class="history-btn history-btn-view" onclick="reprintTicket('${booking.id}')">Reprint Slip</button>
                ${cancelBtnHtml}
            </div>
        `;
        els.bookingHistoryList.appendChild(card);
    });
}

// Reprint active/cancelled bookings
window.reprintTicket = function(bookingId) {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (booking) {
        switchDashboardTab('book');
        state.currentStep = 6;
        updateWizardSteps();
        renderTicket(booking);
    }
};

// Cancel dynamic bookings
window.cancelBooking = function(bookingId) {
    if (confirm('Are you sure you want to cancel this booking? Slots will be released back to the general quota and refunds will be simulated to your original payment method.')) {
        const bookingIdx = state.bookings.findIndex(b => b.id === bookingId);
        if (bookingIdx > -1) {
            state.bookings[bookingIdx].status = 'Cancelled';
            localStorage.setItem(`bookings_${state.currentUser.mobile}`, JSON.stringify(state.bookings));
            showToast('Booking Cancelled', 'Reservation cancelled. Refund has been simulated successfully.', 'success');
            renderBookingHistory();
        }
    }
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

function init() {
    initTheme();
    resetBookingWizard();
    switchView('homeView');
}

window.onload = init;
