import React, { useCallback, useEffect, useRef } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import './AnimatedBackground.css';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const { isDarkMode } = useTheme();
  
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const canvasRef = useRef(null);
  const cursorTrailRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const trail = cursorTrailRef.current;

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      trail.push({
        x,
        y,
        life: 1.0,
        size: Math.random() * 4 + 2,
      });

      // Limit trail length
      if (trail.length > 20) {
        trail.shift();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail
      for (let i = trail.length - 1; i >= 0; i--) {
        const point = trail[i];
        point.life -= 0.05;

        if (point.life <= 0) {
          trail.splice(i, 1);
          continue;
        }

        const alpha = point.life;
        const size = point.size * alpha;

        // Draw gradient circle
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          size * 2
        );
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color1 = isDark ? '100, 200, 255' : '0, 102, 204';
        const color2 = isDark ? '100, 150, 255' : '0, 136, 255';
        
        gradient.addColorStop(0, `rgba(${color1}, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${color2}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${color1}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connecting lines
        if (i > 0) {
          const prevPoint = trail[i - 1];
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          const lineColor = isDark ? '100, 200, 255' : '0, 102, 204';
          ctx.strokeStyle = `rgba(${lineColor}, ${alpha * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <div className="animated-background">
      <Particles
        key={isDarkMode ? 'dark' : 'light'}
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: 'transparent',
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: isDarkMode 
                ? ['#64C8FF', '#64FF96', '#FFD464', '#FF6464']
                : ['#0066cc', '#0088ff', '#00aaff', '#0066cc'],
            },
            links: {
              color: isDarkMode ? '#64C8FF' : '#0066cc',
              distance: 150,
              enable: true,
              opacity: isDarkMode ? 0.3 : 0.2,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            shape: {
              type: ['circle', 'triangle'],
            },
            size: {
              value: { min: 2, max: 5 },
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.5,
                sync: false,
              },
            },
          },
          detectRetina: true,
        }}
      />
      <canvas
        ref={canvasRef}
        className="cursor-trail-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;

