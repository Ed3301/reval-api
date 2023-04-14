import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import Login from './Components/Login';
import Products from './Components/Products';
import './App.css';

function App() {
    return (
        <Router>
            <header className="App-header">
                <Header />
            </header>
            <div className="App">
                <main>
                    <Routes className='app-wrapper-content'>
                        <Route path='/' element={ <Products/> } />
                        <Route path='/login' element={ <Login/> } />
                        <Route path='/products' element={ <Products/> } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
