import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';

function App() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false); // 모델 로드 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let model;

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        model = await tf.loadLayersModel('/model/model.json');
        setModelLoaded(true);
        console.log('Model loaded');
      } catch (error) {
        console.error('Model not found. Please train the model.');
        setModelLoaded(false);
      }
    };
    loadModel();
  }, []);

  // 카메라 시작
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // 이미지 캡처
  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 300, 200);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setImage(dataUrl);

    if (modelLoaded) {
      predictStone(canvasRef.current);
    } else {
      setPrediction('모델을 학습시켜 주세요.');
    }
  };

  // 돌 종류 예측
  const predictStone = async (imgElement) => {
    const tensor = tf.browser
      .fromPixels(imgElement)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat()
      .div(255.0);

    const prediction = model.predict(tensor);
    const categoryIndex = prediction.argMax(1).dataSync()[0];
    const categories = ['장군석', '문인석', '동자석'];
    setPrediction(categories[categoryIndex]);
  };

  return (
    <div>
      <h1>우리옛돌 박물관</h1>
      <p>카메라로 돌을 촬영해 종류를 인식해보세요!</p>

      <video ref={videoRef} autoPlay className="shadow-lg"></video>

      <div>
        <button onClick={startCamera}>카메라 시작</button>
        <button onClick={captureImage}>촬영</button>
      </div>

      {prediction && (
        <div>
          <h2>{prediction}</h2>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width="300"
        height="200"
        className="hidden"
      ></canvas>
    </div>
  );
}

export default App;
