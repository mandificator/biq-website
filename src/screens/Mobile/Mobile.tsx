import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";

export const Mobile = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Device detection function
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('seeker')) {
      return 'seeker';
    } else if (userAgent.includes('android')) {
      return 'android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      return 'ios';
    }
    return 'unknown';
  };

  const handleDownloadApp = () => {
    const deviceType = getDeviceType();
    
    switch (deviceType) {
      case 'android':
        window.open('https://play.google.com/store', '_blank');
        break;
      case 'ios':
        window.open('https://apps.apple.com/app', '_blank');
        break;
      case 'seeker':
        window.open('https://solana.com/dapps', '_blank');
        break;
      default:
        // Fallback - show both options or a generic message
        alert('Please visit your device\'s app store to download the app');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Touch/Mouse tracking for mobile
    function handleTouchMove(event: TouchEvent) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseRef.current = {
          x: touch.clientX / window.innerWidth,
          y: touch.clientY / window.innerHeight
        };
      }
    }

    function handleMouseMove(event: MouseEvent) {
      mouseRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      };
    }

    window.addEventListener('touchmove', handleTouchMove);
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
    const zoom = 0.003;
    const speed = 15;
    let frameCount = 0;

    function animate() {
      if (!canvas || !ctx) return;
      
      frameCount++;
      if (frameCount % 3 !== 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      const w = canvas.width;
      const h = canvas.height;
      
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const mouseInfluence = 30;
      
      const step = 3;
      const img = ctx.createImageData(w, h);
      const data = img.data;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const distanceToMouse = Math.sqrt(
            Math.pow((x / w) - mouseX, 2) + Math.pow((y / h) - mouseY, 2)
          );
          const mouseEffect = Math.sin(distanceToMouse * 8 + t * 1.5) * mouseInfluence;
          
          const fx = Math.sin((x + t * 40 + Math.sin(y * 0.025 + t) * 25 + mouseEffect) * zoom);
          const fy = Math.cos((y + t * 35 + Math.cos(x * 0.02 + t) * 15 + mouseEffect) * zoom);
          const v = (fx + fy + 2) / 4;

          const [r, g, b] = getColor(v);
          
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
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Footer social icons
  const socialIcons = [
    { src: "/telegram.svg", alt: "Telegram" },
    { src: "/twitter.svg", alt: "Twitter" },
    { src: "/gitbook.svg", alt: "Gitbook" },
  ];

  return (
    <div className="bg-white flex flex-col w-full min-h-screen">
      <Card className="bg-transparent overflow-hidden w-full min-h-screen border-none relative">
        <CardContent className="p-0 relative min-h-screen flex flex-col">
          {/* Animated Background Canvas */}
          <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0"
            style={{ zIndex: 0 }}
          />

          <div className="flex flex-col w-full min-h-screen relative z-10">
            {/* Mobile Header - Just logo centered */}
            <header className="flex flex-col items-center w-full bg-transparent pt-12 pb-8">
              <div className="mb-2">
                <img
                  className="w-[50px] h-[55px]"
                  style={{ opacity: 0.75 }}
                  alt="Logo biq"
                  src="/logo_biq.svg"
                />
              </div>
            </header>

            {/* Main content */}
            <div className="flex-grow flex items-center justify-center px-6 py-8 pt-0">
              <div className="w-full text-center [font-family:'GRIFTER-Bold',Helvetica] font-bold text-white tracking-[0]">
                <div className="text-[42px] sm:text-5xl leading-tight mb-[-8px]">
                  turning
                </div>
                <div className="text-[42px] sm:text-5xl leading-tight mb-[-8px]">
                  presence
                </div>
                <div className="text-[42px] sm:text-5xl leading-tight mb-[-8px]">
                  into proof,
                </div>
                <div className="text-[42px] sm:text-5xl leading-tight mb-[-8px]">
                  data, and
                </div>
                <div className="text-[42px] sm:text-5xl leading-tight">
                  rewards.
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <footer className="flex flex-col w-full bg-transparent mt-auto">
              {/* Download App section */}
              <div className="w-full border-t border-[#2c013fcc]">
                <div className="flex items-center justify-center py-6 cursor-pointer hover:bg-white/20 transition-colors" onClick={handleDownloadApp}>
                  <div className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-xl text-center tracking-[0] leading-normal">
                    Download App
                  </div>
                </div>
              </div>

              {/* Social icons row */}
              <div className="w-full border-t border-[#2c013fcc]">
                <div className="flex w-full">
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
                      className="flex-1 flex items-center justify-center py-6 border-r border-[#2c013fcc] last:border-r-0 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <img
                        className="w-[40px] h-[40px]"
                        alt={icon.alt}
                        src={icon.src}
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Footer links - single line with separators */}
              <div className="w-full border-t border-[#2c013fcc]">
                <div className="flex items-center justify-center py-4">
                  <a
                    href="https://www.biq.me/terms.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-sm text-center tracking-[0] leading-normal hover:text-[#2c013f] transition-colors"
                  >
                    Terms
                  </a>
                  <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-sm mx-2">|</span>
                  <a
                    href="https://www.biq.me/privacy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-sm text-center tracking-[0] leading-normal hover:text-[#2c013f] transition-colors"
                  >
                    Privacy
                  </a>
                  <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-sm mx-2">|</span>
                  <a
                    href="https://www.biq.me/forget_me.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-[#2c013fb2] text-sm text-center tracking-[0] leading-normal hover:text-[#2c013f] transition-colors"
                  >
                    Forget Me
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};