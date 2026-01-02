import React, { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import emailjs from 'emailjs-com';
import './Home.css'
import profile from './images/alex.jpg'
import ToastContainer from './ToastContainer';

const TEXTS = ["Fullstack developer", "Frontend Developer", "Backend developer"];

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef(null);
  const [toasts, setToasts] = useState([]);
  
  // Skill animation states
  const [skillPercentages, setSkillPercentages] = useState({
    python: 0,
    fastapi: 0,
    mongodb: 0,
    postgresql: 0,
    react: 0,
    javascript: 0,
    typescript: 0,
    git: 0
  });
  const [skillsAnimated, setSkillsAnimated] = useState(false);

  // Animate skill percentages
  const animateSkill = useCallback((skillKey, targetValue, delay = 0) => {
    const duration = 2000; // 2 seconds
    const startTime = Date.now() + delay;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      if (elapsed >= duration) {
        setSkillPercentages(prev => ({
          ...prev,
          [skillKey]: targetValue
        }));
        return;
      }
      
      const progress = elapsed / duration;
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetValue * easeOutCubic);
      
      setSkillPercentages(prev => ({
        ...prev,
        [skillKey]: current
      }));
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const currentText = TEXTS[currentTextIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.substring(0, displayText.length + 1));
          timeoutRef.current = setTimeout(handleTyping, 80);
        } else {
          // Finished typing, wait then start deleting
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
            timeoutRef.current = setTimeout(handleTyping, 40);
          }, 2500);
        }
      } else {
        // Deleting backward
        if (displayText.length > 0) {
          setDisplayText(displayText.substring(0, displayText.length - 1));
          timeoutRef.current = setTimeout(handleTyping, 40);
        } else {
          // Finished deleting, fade out then fade in with next text
          setIsVisible(false);
          setTimeout(() => {
            setIsDeleting(false);
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % TEXTS.length);
            setTimeout(() => {
              setIsVisible(true);
              timeoutRef.current = setTimeout(handleTyping, 100);
            }, 50);
          }, 300);
        }
      }
    };

    if (isVisible) {
      timeoutRef.current = setTimeout(handleTyping, 100);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, currentTextIndex, isDeleting, isVisible]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Toast notification functions
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.querySelector('span')?.textContent;
    if (submitButton && originalText) {
      submitButton.disabled = true;
      submitButton.querySelector('span').textContent = 'Sending...';
    }

    // Map form data to EmailJS template variables
    const templateParams = {
      from_name: formData.name,        // Maps to {{from_name}} in template
      email_id: formData.email,        // Maps to {{email_id}} in template
      message: formData.message,       // Maps to {{message}} in template
      to_email: 'theapakalex@gmail.com' // Your email address
    };

    emailjs
      .send(
        'service_o3op9qd',        // Replace with your EmailJS Service ID
        'template_u0ed0zu',       // Replace with your EmailJS Template ID
        templateParams,            // Pass the mapped template parameters
        'WzafPeLExLDmFw5I_'            // Replace with your EmailJS User ID
      )
      .then(
        (result) => {
          console.log('Email sent successfully:', result.text);
          showToast('Message sent successfully!', 'success', 4000);
          // Reset form
          setFormData({
            name: '',
            email: '',
            message: ''
          });
        },
        (error) => {
          console.error('Error sending email:', error);
          let errorMessage = 'Failed to send message. Please try again.';
          
          // Provide more specific error messages
          if (error.text && error.text.includes('Invalid grant')) {
            errorMessage = 'Email service configuration error. Please contact the website administrator.';
          } else if (error.text && error.text.includes('Gmail_API')) {
            errorMessage = 'Email service needs to be reconfigured. Please contact the website administrator.';
          }
          
          showToast(errorMessage, 'error', 5000);
        }
      )
      .finally(() => {
        // Reset button state
        if (submitButton && originalText) {
          submitButton.disabled = false;
          submitButton.querySelector('span').textContent = originalText;
        }
      });
  };

  // Cursor-based tilt animation for project cards
  const handleProjectMouseMove = (e) => {
    const card = e.currentTarget;
    if (!card) return;
    
    // Stop any ongoing animations
    card.style.animation = 'none';
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized position (-1 to 1)
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;
    
    // Tilt effect - pronounced 3D rotation
    const rotateX = normalizedY * -15; // Max 15 degrees tilt
    const rotateY = normalizedX * 15; // Max 15 degrees tilt
    
    // Scale effect when hovering
    const scale = 1.05;
    
    // Apply transform with smooth tilt effect - no transition during mouse move for instant response
    card.style.transition = 'none';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    card.style.zIndex = '10';
  };

  const handleProjectMouseLeave = (e) => {
    const card = e.currentTarget;
    if (!card) return;
    
    // Smooth return to original position
    card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.zIndex = '1';
  };

  // Scroll animation refs
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const educationRef = useRef(null);
  const projectsRef = useRef(null);
  const contactRef = useRef(null);

  // Handle scroll to contact section
  const handleContactMeClick = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('contacts');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
          
          // Trigger skill animations when skills section is visible
          if (entry.target.id === 'skills' && !skillsAnimated) {
            setSkillsAnimated(true);
            animateSkill('python', 95, 200);
            animateSkill('fastapi', 92, 400);
            animateSkill('mongodb', 88, 600);
            animateSkill('postgresql', 85, 800);
            animateSkill('react', 90, 1000);
            animateSkill('javascript', 88, 1200);
            animateSkill('typescript', 85, 1400);
            animateSkill('git', 90, 1600);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = [aboutRef, skillsRef, educationRef, projectsRef, contactRef];
    sections.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [skillsAnimated, animateSkill]);

  return (
    <Fragment>
      <div className='profile' id='profile'>
        <div className='pro-detail'>
          <h1>Hi, I'm Alexraj</h1>
          <h3 className={`typewriter-text ${isVisible ? 'visible' : 'hidden'}`}>
            {displayText}
            <span className="cursor">|</span>
          </h3>
          <p>I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines.</p>
          <button onClick={handleContactMeClick}>Contact Me</button>
        </div>
        <div className='pro-img'>
          <div className="profile-animation-wrapper">
            <div className="rotating-ring ring-1"></div>
            <div className="rotating-ring ring-2"></div>
          <span><img src={profile} alt='profile'></img></span>
          </div>
        </div>
      </div>
      <div className='about scroll-section' id='about' ref={aboutRef}>
        <div>
        <h1>About Me</h1>
        <h5>Fullstack Developer</h5>
        <p>I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines.
        I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines
        </p>
        </div>
      </div>
      <div className='skills scroll-section' id='skills' ref={skillsRef}>
        <div className='skills-container'>
          <h1 className='skills-title'>
            Technical <span className='gradient-text'>Arsenal</span>
          </h1>
          <p className='skills-subtitle'>
            A blend of enterprise reliability and creative flair. Battle-tested in production environments.
          </p>
          <div className='skill-contain'>
            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-code-slash"></i>
                </div>
                <span className='skill-category'>BACKEND</span>
              </div>
              <h3 className='skill-name'>Python</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.python}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.python}%`}}></div>
              </div>
            </div>
            
            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-server"></i>
                </div>
                <span className='skill-category'>BACKEND</span>
              </div>
              <h3 className='skill-name'>FastAPI</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.fastapi}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.fastapi}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-database"></i>
                </div>
                <span className='skill-category'>BACKEND</span>
              </div>
              <h3 className='skill-name'>MongoDB</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.mongodb}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.mongodb}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-database-fill"></i>
                </div>
                <span className='skill-category'>BACKEND</span>
              </div>
              <h3 className='skill-name'>PostgreSQL</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.postgresql}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.postgresql}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-browser-chrome"></i>
                </div>
                <span className='skill-category'>FRONTEND</span>
              </div>
              <h3 className='skill-name'>React</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.react}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.react}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-filetype-js"></i>
                </div>
                <span className='skill-category'>FRONTEND</span>
              </div>
              <h3 className='skill-name'>JavaScript</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.javascript}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.javascript}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-filetype-tsx"></i>
                </div>
                <span className='skill-category'>FRONTEND</span>
              </div>
              <h3 className='skill-name'>TypeScript</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.typescript}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.typescript}%`}}></div>
              </div>
            </div>

            <div className='skill-card'>
              <div className='skill-card-header'>
                <div className='skill-icon'>
                  <i className="bi bi-git"></i>
                </div>
                <span className='skill-category'>TOOLS</span>
              </div>
              <h3 className='skill-name'>Git & GitHub</h3>
              <div className='skill-level-info'>
                <span className='skill-level-label'>SKILL LEVEL</span>
                <span className='skill-percentage'>{skillPercentages.git}%</span>
              </div>
              <div className='skill-progress-bar'>
                <div className='skill-progress-fill' style={{width: `${skillPercentages.git}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='educations scroll-section' id='educations' ref={educationRef}>
        <div className='educations-container'>
          <h1 className='educations-title'>Education</h1>
          <div className='education-contain'>
            <div className='education-card'>
              <div className='education-card-header'>
                <div className='education-icon'>
                  <i className="bi bi-mortarboard"></i>
                </div>
                <span className='education-type'>DEGREE</span>
              </div>
              <h3 className='education-degree'>B.E Computer Science and Engineering</h3>
              <div className='education-details'>
                <p className='education-institution'>Jayalakshmi Institute of Technology</p>
                <p className='education-period'>2021 - 2024</p>
              </div>
            </div>
            
            <div className='education-card'>
              <div className='education-card-header'>
                <div className='education-icon'>
                  <i className="bi bi-book"></i>
                </div>
                <span className='education-type'>DIPLOMA</span>
              </div>
              <h3 className='education-degree'>Diploma in Mechanical Engineering</h3>
              <div className='education-details'>
                <p className='education-institution'>Shreenivasa Polytechnic College</p>
                <p className='education-period'>2018 - 2020</p>
              </div>
            </div>
            
            <div className='education-card'>
              <div className='education-card-header'>
                <div className='education-icon'>
                  <i className="bi bi-award"></i>
                </div>
                <span className='education-type'>CERTIFICATE</span>
              </div>
              <h3 className='education-degree'>Higher Secondary Certificate</h3>
              <div className='education-details'>
                <p className='education-institution'>Government Higher School</p>
                <p className='education-period'>2017 - 2018</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='project-contain scroll-section' id='projects' ref={projectsRef}>
        <div className='projects-container'>
          <h1 className='projects-title'>Projects</h1>
          <div className='projects'>
            <div className='project-card' onMouseMove={handleProjectMouseMove} onMouseLeave={handleProjectMouseLeave}>
              <div className='project-image-wrapper'>
                <img className='project-image' src='https://www.citlprojects.com/hubfs/featured-image/voice-based-email-for-blind-768x480.jpg' alt='Voice based email system project'></img>
              </div>
              <div className='project-content'>
                <div className='project-tech-tags'>
                  <span className='tech-tag'>Python</span>
                  <span className='tech-tag'>Speech Recognition</span>
                  <span className='tech-tag'>TTS</span>
                </div>
                <h3 className='project-title'>Voice Based Email System</h3>
                <p className='project-description'>The user can compose an email just by speaking the content and the application will automatically convert it into text.</p>
                <div className='project-actions'>
                  <button className='project-btn'>
                    <a href='https://github.com' target='_blank' rel='noopener noreferrer'>
                      <i className="bi bi-github"></i> View Code
                    </a>
                  </button>
                </div>
              </div>
            </div>
            
            <div className='project-card' onMouseMove={handleProjectMouseMove} onMouseLeave={handleProjectMouseLeave}>
              <div className='project-image-wrapper'>
                <img className='project-image' src='https://ijritcc.org/public/journals/1/submission_7607_7553_coverImage_en_US.png' alt='Skin disease detection using deep learning project'></img>
              </div>
              <div className='project-content'>
                <div className='project-tech-tags'>
                  <span className='tech-tag'>Python</span>
                  <span className='tech-tag'>CNN</span>
                  <span className='tech-tag'>Deep Learning</span>
                </div>
                <h3 className='project-title'>Skin Disease Detection using Deep Learning</h3>
                <p className='project-description'>This work provides an automated image-based method for diagnosing and categorizing skin diseases using CNN.</p>
                <div className='project-actions'>
                  <button className='project-btn'>
                    <a href='https://github.com' target='_blank' rel='noopener noreferrer'>
                      <i className="bi bi-github"></i> View Code
                    </a>
                  </button>
                </div>
              </div>
            </div>
            
            <div className='project-card' onMouseMove={handleProjectMouseMove} onMouseLeave={handleProjectMouseLeave}>
              <div className='project-image-wrapper'>
                <img className='project-image' src='https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop' alt='Ecommerce website using React.js project'></img>
              </div>
              <div className='project-content'>
                <div className='project-tech-tags'>
                  <span className='tech-tag'>React</span>
                  <span className='tech-tag'>JavaScript</span>
                  <span className='tech-tag'>Node.js</span>
                </div>
                <h3 className='project-title'>Ecommerce Website using React.js</h3>
                <p className='project-description'>A React eCommerce application with product listing, shopping cart, checkout page, and payment integration.</p>
                <div className='project-actions'>
                  <button className='project-btn'>
                    <a href='https://github.com' target='_blank' rel='noopener noreferrer'>
                      <i className="bi bi-github"></i> View Code
                    </a>
                  </button>
                </div>
              </div>
            </div>
            
            <div className='project-card' onMouseMove={handleProjectMouseMove} onMouseLeave={handleProjectMouseLeave}>
              <div className='project-image-wrapper'>
                <img className='project-image' src='https://www.hubspot.com/hs-fs/hubfs/interior-design-websites-cathie-hong-interiors.jpg?width=650&height=370&name=interior-design-websites-cathie-hong-interiors.jpg' alt='Premium interior design website project'></img>
              </div>
              <div className='project-content'>
                <div className='project-tech-tags'>
                  <span className='tech-tag'>React</span>
                  <span className='tech-tag'>TypeScript</span>
                  <span className='tech-tag'>CSS</span>
                </div>
                <h3 className='project-title'>Premium Interior Design Website</h3>
                <p className='project-description'>An interior design website that helps reach a broader audience while showcasing skills as an artist.</p>
                <div className='project-actions'>
                  <button className='project-btn'>
                    <a href='https://github.com' target='_blank' rel='noopener noreferrer'>
                      <i className="bi bi-github"></i> View Code
                    </a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='contact scroll-section' id='contacts' ref={contactRef}>
        <div className='contact-title'><h1>CONTACT</h1></div>
        <div className='contact-cover'>
        <div className='contact-user'>
          <p>If you have any questions or concerns, please don't hesitate to contact me. I am open to any work opportunities that align with my skills and interests.</p>
          <form onSubmit={sendEmail} className='contact-form'>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      <div className='button'><button type="submit"><span>Send Message</span></button></div>
    </form>
        </div>
        <div className='contact-my'>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=theapakalex@gmail.com" target="_blank" rel="noopener noreferrer" className='contact-icon'>
            <span><i className="bi bi-envelope-at"></i></span>
            <p>theapakalex@gmail.com</p>
          </a>
          <a href="tel:+916382900549" className='contact-icon'>
            <span><i className="bi bi-telephone"></i></span>
            <p>6382900549</p>
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=Bangalore,India" target="_blank" rel="noopener noreferrer" className='contact-icon'>
            <span><i className="bi bi-house"></i></span>
            <p>Bangalore,India</p>
          </a>
          <div className='contact-icon social'>
            <a href="https://www.instagram.com/a.l.e.x_._j.s.t?igsh=MWxlOTg4aGZxMDF5Zw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span><i className="bi bi-instagram"></i></span>
            </a>
            <a href="https://www.linkedin.com/in/alexraj2000" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span><i className="bi bi-linkedin"></i></span>
            </a>
            <a href="https://github.com/alexhacks007" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <span><i className="bi bi-github"></i></span>
            </a>
            <a href="https://wa.me/916382900549" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <span><i className="bi bi-whatsapp"></i></span>
            </a>
          </div>
        </div>
      </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Fragment>
  )
}

export default Home