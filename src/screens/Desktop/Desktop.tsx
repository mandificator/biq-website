import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

export const Desktop = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mouse tracking
    function handleMouseMove(event: MouseEvent) {
      mouseRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      };
    }

    window.addEventListener('mousemove', handleMouseMove);
    function resizeCanvas() {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const palette: [number, number, number][] = [
      [255, 165, 100], [15, 205, 220],
      [120, 100, 235], [100, 190, 200],
      [225, 60, 200], [230, 50, 170]
    ];

    function lerp(a: number, b: number, t: number): number {
      return a + (b - a) * t;
    }

    function getColor(value: number): [number, number, number] {
      const scaled = value * (palette.length - 1);
      const i = Math.floor(scaled);
      const t = scaled - i;
      const c1 = palette[i % palette.length];
      const c2 = palette[(i + 1) % palette.length];
      return [
        Math.floor(lerp(c1[0], c2[0], t)),
        Math.floor(lerp(c1[1], c2[1], t)),
        Math.floor(lerp(c1[2], c2[2], t))
      ];
    }

    let t = 0;
    const zoom = 0.0025;
    const speed = 20;
    const blur = 0;
    let frameCount = 0;

    function animate() {
      if (!canvas || !ctx) return;
      
      // Skip frames to reduce CPU load
      frameCount++;
      if (frameCount % 2 !== 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      if (blur > 0) {
        canvas.style.filter = `blur(${blur}px)`;
      }
      const w = canvas.width;
      const h = canvas.height;
      
      // Mouse influence
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const mouseInfluence = 50;
      // Use lower resolution for better performance
      const step = 2;
      const img = ctx.createImageData(w, h);
      const data = img.data;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          // Add mouse influence to the wave calculations
          const distanceToMouse = Math.sqrt(
            Math.pow((x / w) - mouseX, 2) + Math.pow((y / h) - mouseY, 2)
          );
          const mouseEffect = Math.sin(distanceToMouse * 10 + t * 2) * mouseInfluence;
          
          const fx = Math.sin((x + t * 50 + Math.sin(y * 0.02 + t) * 30 + mouseEffect) * zoom);
          const fy = Math.cos((y + t * 40 + Math.cos(x * 0.015 + t) * 20 + mouseEffect) * zoom);
          const v = (fx + fy + 2) / 4;

          const [r, g, b] = getColor(v);
          
          // Fill multiple pixels for lower resolution
          for (let dy = 0; dy < step && y + dy < h; dy++) {
            for (let dx = 0; dx < step && x + dx < w; dx++) {
              const i = ((y + dy) * w + (x + dx)) * 4;
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
              data[i + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(img, 0, 0);
      t += speed * 0.003;
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Header navigation items
  const headerItems = [
    { text: "biqProtocol", position: "left" },
    { text: "Download App", position: "right" },
  ];

  // Footer social icons
  const socialIcons = [
    { src: "/telegram.svg", alt: "Telegram" },
    { src: "/twitter.svg", alt: "Twitter" },
    { src: "/gitbook.svg", alt: "Gitbook" },
  ];

  // Footer links
  const footerLinks = [
    { text: "Terms of Service" },
    { text: "Privacy Policy" },
    { text: "Forget Me" },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <Card className="bg-transparent overflow-hidden w-full max-w-[1512px] min-h-screen border-none relative">
        <CardContent className="p-0 relative min-h-screen flex flex-col">
          {/* Animated Background Canvas */}
          <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0"
            style={{ zIndex: 0 }}
          />

          <div className="flex flex-col w-full min-h-screen relative z-10">
            <header className="flex w-full items-start justify-center relative bg-transparent">
              {/* Left header item */}
              {/* <div className="flex h-[92px] items-center justify-center pt-[25px] pb-5 px-[30px] border-b border-[#2c013fcc] hover:bg-white/20 transition-colors cursor-pointer">
                <div className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-2xl text-center tracking-[0] leading-normal whitespace-nowrap">
                  {headerItems[0].text}
                </div>
              </div> */}

              {/* Center logo */}
              <div className="flex flex-col h-[120px] items-center justify-end">
                <img
                  className="w-[60px] h-[65px]"
                  style={{ opacity: 0.75 }}
                  alt="Logo biq"
                  src="/logo_biq.svg"
                />
              </div>

              {/* Right header item */}
              {/* <div className="flex h-[92px] items-center justify-center pt-[25px] pb-5 px-[30px] border-b border-[#2c013fcc] hover:bg-white/20 transition-colors cursor-pointer">
                <div className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-2xl text-center tracking-[0] leading-normal whitespace-nowrap">
                  {headerItems[1].text}
                </div>
              </div> */}
            </header>

            {/* Main content - grows to push footer down */}
            <div className="flex-grow flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8">
              <div className="w-full max-w-[1147px] text-center [font-family:'GRIFTER-Bold',Helvetica] font-bold text-white tracking-[0]">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] leading-tight sm:leading-tight md:leading-tight lg:leading-normal">
                  turning presence into proof,
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl mt-[-20px] lg:text-6xl xl:text-[72px] leading-tight sm:leading-tight md:leading-tight lg:leading-normal">
                  data, and rewards.
                </div>
              </div>
            </div>

            {/* Footer - sticks to bottom */}
            <footer className="flex flex-col items-start w-full bg-transparent mt-auto">
              <div className="w-full h-px bg-[#2c013fcc]"></div>

              <div className="flex justify-between w-full">
                {/* Social icons */}
                <div className="flex items-center">
                  {socialIcons.map((icon, index) => (
                    <a
                      key={`social-link-${index}`}
                      href={
                        icon.alt === 'Telegram' ? 'https://www.biq.me/terms.pdf' :
                        icon.alt === 'Twitter' ? 'https://x.com/biqProtocol' :
                        icon.alt === 'Gitbook' ? 'https://biq-protocol.gitbook.io/biq/' : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-[84px] items-center justify-center px-[30px] py-2.5 border-r border-[#2c013fcc] cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <img
                        className="w-[50px] h-[50px] hover:scale-100"
                        alt={icon.alt}
                        src={icon.src}
                      />
                    </a>
                  ))}
                </div>

                {/* Footer links */}
                <div className="flex items-center">
                  {footerLinks.map((link, index) => (
                    <a
                      key={`footer-link-${index}`}
                      href={
                        link.text === 'Terms of Service' ? 'https://www.biq.me/terms.pdf' :
                        link.text === 'Privacy Policy' ? 'https://www.biq.me/privacy.pdf' :
                        link.text === 'Forget Me' ? 'https://www.biq.me/forget_me.pdf' : '#'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-[84px] items-center justify-center pt-[25px] pb-5 px-[30px] border-l border-[#2c013fcc] cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-2xl text-center tracking-[0] leading-normal whitespace-nowrap">
                        {link.text}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};