// js/firebase.js (This version is correct)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0pp5DYUbd08eyFy8_6dZX92zMyG00xLw",
  authDomain: "game-think.firebaseapp.com",
  databaseURL: "https://game-think-default-rtdb.firebaseio.com",
  projectId: "game-think",
  storageBucket: "game-think.firebasestorage.app",
  messagingSenderId: "467980852911",
  appId: "1:467980852911:web:f9e1dc38f4bf223685be5a",
  measurementId: "G-Q1VGHT1PYN"
};

if (!firebaseConfig.databaseURL || firebaseConfig.databaseURL === "https://game-think-default-rtdb.firebaseio.com/") {
  console.warn("Firebase Realtime Database URL 未設定！貪食蛇等使用 RTDB 的功能可能無法運作。請在 firebaseConfig 中添加 databaseURL。");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // This connects to Cloud Firestore
const rtdb = getDatabase(app); // This connects to Realtime Database

export { db, rtdb };


