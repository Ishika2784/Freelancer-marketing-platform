import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';

const Dashboard3D = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} />
        <FloatingButton />
        {/* Add 3D components here */}
      </Canvas>
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-white text-4xl font-bold text-center mt-10">
          Futuristic 3D Dashboard
        </h1>
      </motion.div>
    </div>
  );
};

const FloatingButton = () => {
  return (
    <Html position={[0, 1, 0]}>
      <button
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-110 transform transition-transform"
      >
        Click Me
      </button>
    </Html>
  );
};

export default Dashboard3D;