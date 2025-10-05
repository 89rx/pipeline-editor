import { useEffect, useRef } from 'react';
import './HeaderParticles.css';

export const HeaderParticles = () => {
  const particlesRef = useRef(null);
  const particles = useRef([]);
  const animationFrame = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouseActive = useRef(false);

  useEffect(() => {
    const header = particlesRef.current?.parentElement;
    if (!header) return;

    // Store ref in variable for cleanup
    const currentParticlesRef = particlesRef.current;

    // Create particles
    const createParticles = () => {
      const particleCount = 80;
      const headerRect = header.getBoundingClientRect();
      
      particles.current = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position within header
        const x = Math.random() * headerRect.width;
        const y = Math.random() * headerRect.height;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Random size and opacity for variety
        const size = 3 + Math.random() * 4;
        const opacity = 0.4 + Math.random() * 0.4; // More visible
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        
        // Add natural wandering behavior
        const wanderStrength = 0.1 + Math.random() * 0.2;
        const wanderChange = 0.02 + Math.random() * 0.03;
        
        currentParticlesRef.appendChild(particle);
        particles.current.push({
          element: particle,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5, // Increased base movement
          vy: (Math.random() - 0.5) * 0.5,
          originalX: x,
          originalY: y,
          size,
          opacity,
          repelForce: 0,
          wanderStrength,
          wanderChange,
          wanderTime: Math.random() * 100,
          targetVx: 0,
          targetVy: 0
        });
      }
    };

    // Update wandering targets
    const updateWandering = (particle, time) => {
      particle.wanderTime += particle.wanderChange;
      
      // Change wandering direction occasionally
      if (Math.random() < 0.02) {
        particle.targetVx = (Math.random() - 0.5) * particle.wanderStrength;
        particle.targetVy = (Math.random() - 0.5) * particle.wanderStrength;
      }
      
      // Smoothly approach target velocity
      particle.vx += (particle.targetVx - particle.vx) * 0.05;
      particle.vy += (particle.targetVy - particle.vy) * 0.05;
      
      // Add some noise for organic movement
      const noiseX = Math.sin(particle.wanderTime) * 0.01;
      const noiseY = Math.cos(particle.wanderTime * 0.7) * 0.01;
      particle.vx += noiseX;
      particle.vy += noiseY;
    };

    // Repel particles from mouse position
    const repelParticlesFromMouse = () => {
      if (!mouseActive.current) return;

      particles.current.forEach(particle => {
        const dx = particle.x - mousePosition.current.x;
        const dy = particle.y - mousePosition.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) { // Increased repel radius
          const force = Math.pow((120 - distance) / 120, 2); // Quadratic falloff
          const angle = Math.atan2(dy, dx);
          
          particle.vx += Math.cos(angle) * force * 3;
          particle.vy += Math.sin(angle) * force * 3;
          particle.repelForce = force;
          
          // Visual feedback
          particle.element.style.opacity = Math.min(1, particle.opacity + force * 0.8);
          particle.element.style.transform = `scale(${1 + force * 0.8})`;
        }
      });
    };

    // Add mouse move listener to header
    const handleMouseMove = (e) => {
      const headerRect = header.getBoundingClientRect();
      mousePosition.current = {
        x: e.clientX - headerRect.left,
        y: e.clientY - headerRect.top
      };
      mouseActive.current = true;
    };

    const handleMouseLeave = () => {
      mouseActive.current = false;
    };

    header.addEventListener('mousemove', handleMouseMove);
    header.addEventListener('mouseleave', handleMouseLeave);

    // Animate particles
    const animateParticles = () => {
      const headerRect = header.getBoundingClientRect();
      const time = Date.now() * 0.001;
      
      particles.current.forEach(particle => {
        // Update wandering behavior
        updateWandering(particle, time);
        
        // Apply gentle return to original position
        const returnStrength = 0.01; // Reduced for more freedom
        particle.vx += (particle.originalX - particle.x) * returnStrength;
        particle.vy += (particle.originalY - particle.y) * returnStrength;
        
        // Apply friction
        particle.vx *= 0.97;
        particle.vy *= 0.97;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Soft bounds with gentle pushback
        const margin = 30;
        if (particle.x < margin) particle.vx += 0.2;
        if (particle.x > headerRect.width - margin) particle.vx -= 0.2;
        if (particle.y < margin) particle.vy += 0.2;
        if (particle.y > headerRect.height - margin) particle.vy -= 0.2;
        
        // Keep within bounds
        particle.x = Math.max(-10, Math.min(headerRect.width + 10, particle.x));
        particle.y = Math.max(-10, Math.min(headerRect.height + 10, particle.y));
        
        // Gradually reduce repel effects
        if (particle.repelForce > 0) {
          particle.repelForce *= 0.92;
          particle.element.style.opacity = particle.opacity + particle.repelForce * 0.6;
          particle.element.style.transform = `scale(${1 + particle.repelForce * 0.4})`;
        } else {
          // Natural opacity variation
          const opacityVariation = Math.sin(time + particle.wanderTime) * 0.1;
          particle.element.style.opacity = Math.max(0.3, particle.opacity + opacityVariation);
        }
        
        // Update element position
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
      });
      
      repelParticlesFromMouse();
      animationFrame.current = requestAnimationFrame(animateParticles);
    };

    createParticles();
    animateParticles();

    // Handle resize
    const handleResize = () => {
      const headerRect = header.getBoundingClientRect();
      particles.current.forEach(particle => {
        // Scale positions to new header size
        particle.x = (particle.x / headerRect.width) * header.getBoundingClientRect().width;
        particle.y = (particle.y / headerRect.height) * header.getBoundingClientRect().height;
        particle.originalX = particle.x;
        particle.originalY = particle.y;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      window.removeEventListener('resize', handleResize);
      header.removeEventListener('mousemove', handleMouseMove);
      header.removeEventListener('mouseleave', handleMouseLeave);
      
      // Clean up particles using the stored ref
      if (currentParticlesRef) {
        while (currentParticlesRef.firstChild) {
          currentParticlesRef.removeChild(currentParticlesRef.firstChild);
        }
      }
    };
  }, []);

  return <div ref={particlesRef} className="header-particles" />;
};