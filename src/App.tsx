import React from 'react';
import icon from '../assets/icon.svg';
import './App.global.css';
import Widget from './components/Widget';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return <Widget />;
}
