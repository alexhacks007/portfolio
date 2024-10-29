import React, { Fragment, useState } from 'react';
import emailjs from 'emailjs-com';
import './Home.css'
import profile from './images/alex.jpg'

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .send(
        'service_j58bjxu',        // Replace with your EmailJS Service ID
        'template_u0ed0zu',       // Replace with your EmailJS Template ID
        formData,                 // Pass the form data
        'WzafPeLExLDmFw5I_'            // Replace with your EmailJS User ID
      )
      .then(
        (result) => {
          console.log('Email sent successfully:', result.text);
          alert('Message sent successfully!');
        },
        (error) => {
          console.error('Error sending email:', error.text);
          alert('Failed to send message, please try again.');
        }
      );
  };
  return (
    <Fragment>
      <div className='profile' id='profile'>
        <div className='pro-detail'>
          <h1>Hi, I'm Alexraj</h1>
          <h3>Fullstack developer</h3>
          <p>I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines.</p>
          <button>Contact Me</button>
        </div>
        <div className='pro-img'>
          <span><img src={profile} alt='profile'></img></span>
        </div>
      </div>
      <div className='about' id='about'>
        <div>
        <h1>About Me</h1>
        <h5>Fullstack Developer</h5>
        <p>I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines.
        I am an enthusiastic, self-motivated, reliable, responsible and hard working person. I am a mature team worker and adaptable to all challenging situations. I am able to work well both in a team environment as well as using own initiative. I am able to work well under pressure and adhere to strict deadlines
        </p>
        </div>
      </div>
      <div className='skills' id='skills'>
        <div>
        <h1>My Skills</h1>
        <div className='skill-contain'>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/python-programming-language-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/javascript-programming-language-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/html-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/css-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/bootstrap-5-logo-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
          <div className='skill'><img src='https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/react-js-icon.png' alt='1html' width={"70px"}></img><h6>HTML5</h6></div>
        </div>
        </div>
      </div>
      <div className='educations' id='educations'>
        <h1>Education</h1>
        <div className='education-contain'>
        <div className='education'>
          <div className='edu-course'>
            <p>B.E COMPUTER SCIENCE AND ENGINEERING</p>
            <p>2021-2024</p>
          </div>
          <p className='edu-college'>Jayalakshmi institute of technology</p>
        </div>
        <div className='education'>
        <div className='edu-course'>
            <p>DIPLOMA IN MECHANINCAL ENGINEERING</p>
            <p>2018-2020</p>
          </div>
          <p className='edu-college'>Shreenivasa polytechnic college</p>
        </div>
        <div className='education'>
        <div className='edu-course'>
            <p>HIGHER SECONDARY CERTIFICATE</p>
            <p>2017-2018</p>
          </div>
          <p className='edu-college'>Government Higher School</p>
        </div>
        </div>
      </div>
      <div className='project-contain' id='projects'>
        <h1>PROJECTS</h1>
        <div className='projects'>
          <div className='project'>
            <img className='project-image' src='https://www.citlprojects.com/hubfs/featured-image/voice-based-email-for-blind-768x480.jpg'></img>
            <div className='project-content'>
              <p>2023</p>
              <p>Voice based email system</p>
              <p>The user can compose an email just by speaking the content and the application will automatically convert it into text. </p>
              <div><button><a>Github</a></button></div>
            </div>
          </div>
          <div className='project'>
            <img className='project-image' src='https://ijritcc.org/public/journals/1/submission_7607_7553_coverImage_en_US.png'></img>
            <div className='project-content'>
              <p>2024</p>
              <p>skin disease detection using deep learning</p>
              <p>This work provides an automated image-based method for diagnosing and categorizing...</p>
              <div><button><a>Github</a></button></div>
            </div>
          </div>
          <div className='project'>
            <img className='project-image' src='https://www.tigren.com/blog/wp-content/uploads/2021/11/ecommerce-design-strategies.png'></img>
            <div className='project-content'>
              <p>2024</p>
              <p>ecommerce website using reactjs</p>
              <p>A React eCommerce application typically involves building a product listing page, a shopping cart, a checkout page, and a payment...</p>
              <div><button><a>Github</a></button></div>
            </div>
          </div>
          <div className='project'>
            <img className='project-image' src='https://www.hubspot.com/hs-fs/hubfs/interior-design-websites-cathie-hong-interiors.jpg?width=650&height=370&name=interior-design-websites-cathie-hong-interiors.jpg'></img>
            <div className='project-content'>
              <p>2024</p>
              <p>Premium interior design website</p>
              <p>An interior design website helps you do that. It allows you to reach a broader audience while showcasing your skills as an artist.</p>
              <div><button><a>Github</a></button></div>
            </div>
          </div>
        </div>
      </div>
      <div className='contact' id='contacts'>
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
      <div className='button'><button type="submit">Send Message</button></div>
    </form>
        </div>
        <div className='contact-my'>
          <div className='contact-icon'><span><i class="bi bi-envelope-at"></i></span><p>theapakalex@gmail.com</p></div>
          <div className='contact-icon'><span><i class="bi bi-telephone"></i></span><p>6382900549</p></div>
          <div className='contact-icon'><span><i class="bi bi-house"></i></span><p>Bangalore,India</p></div>
          <div className='contact-icon social'><span><i class="bi bi-instagram"></i></span><span><i class="bi bi-linkedin"></i></span><span><i class="bi bi-github"></i></span><span><i class="bi bi-whatsapp"></i></span></div>
        </div>
      </div>
      </div>
    </Fragment>
  )
}

export default Home