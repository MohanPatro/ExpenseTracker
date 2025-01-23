import React from 'react';
import './Home.css';

const Home = ({ onCardClick }) => {
    return (
        <div className="home-container">
            <h2>IRCTC Details</h2>
            <div className="card-grid">
                <div className="card" onClick={() => onCardClick('IRCTC')}>
                    <h3>IRCTC</h3>
                </div>
            </div>
        </div>
    );
};

export default Home;