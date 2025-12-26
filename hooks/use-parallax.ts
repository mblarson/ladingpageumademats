
import { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export const useParallax = () => {
  // Motion values variam de -1 a 1
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring suaviza o movimento (efeito bounce/smooth)
  const smoothX = useSpring(x, { damping: 20, stiffness: 200 });
  const smoothY = useSpring(y, { damping: 20, stiffness: 200 });

  const [permissionGranted, setPermissionGranted] = useState(false);

  // Manipulador de Mouse (Desktop)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normaliza para -1 a 1 baseado no centro da tela
      const newX = (e.clientX / window.innerWidth - 0.5) * 2;
      const newY = (e.clientY / window.innerHeight - 0.5) * 2;
      x.set(newX);
      y.set(newY);
    };

    // Apenas adiciona mouse se não houver orientação de dispositivo ativa ou como fallback
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  // Lógica de Permissão iOS e Orientação
  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (e) {
        console.error("Erro ao solicitar permissão de orientação", e);
      }
    } else {
      // Dispositivos que não precisam de permissão (Android/iOS antigo)
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!e.gamma || !e.beta) return;

    // Gamma: Esquerda/Direita (-90 a 90) -> clamp entre -45 e 45
    // Beta: Frente/Trás (-180 a 180) -> clamp entre -45 e 45 (considerando segurar o celular inclinado)
    
    let moveX = e.gamma; 
    let moveY = e.beta; 

    // Limitar valores para evitar rotação completa
    if (moveX > 45) moveX = 45;
    if (moveX < -45) moveX = -45;
    if (moveY > 45) moveY = 45;
    if (moveY < -45) moveY = -45;

    // Normalizar para -1 a 1
    // Invertemos X para movimento natural tipo "janela"
    x.set(moveX / 45);
    y.set((moveY - 20) / 45); // -20 offset para posição natural de segurar o celular
  };

  // Tenta iniciar ouvintes básicos se não for iOS estrito
  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
       window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return { x: smoothX, y: smoothY, requestAccess };
};
