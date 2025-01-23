import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Table.css';

const Table = ({ userName }) => {
    const [emails, setEmails] = useState([]);
    const [filter, setFilter] = useState('all');
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/getExistedEmailData')
            .then((response) => {
                setEmails(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the email data!", error);
            });
    }, []);

    const hasCancellation = (email) => email.Status === 'Cancelled';
    const hasRefund = (email) => email.Status === 'Refund Success';
    const isJourneyCompleted = (email) => email.Status === 'Journey Completed';

    const filteredEmails = emails.filter((email) => {
        if (filter === 'all') return true;
        if (filter === 'completed') return isJourneyCompleted(email);
        if (filter === 'cancellation') return hasCancellation(email);
        if (filter === 'refund') return hasRefund(email);
        return true;
    });

    const getStatusColor = (status) => {
        if (status === 'Cancelled') return '#cc0303';
        if (status === 'Refund Success') return '#212EA0';
        if (status === 'Journey Completed') return 'green';
        if(status==='Upcoming Journey') return '#ffA500'
        return 'black';
    };
    const currentDate = new Date(); // Get the current date

    const getJourneyStatus = (dateString,status) => {
        if(status!='Journey Completed' && status!='Ticket Booked')
        {
            return status;
        }
        const journeyDate = new Date(dateString); // Parse the journey date
        return journeyDate < currentDate ? 'Journey Completed' : 'Upcoming Journey'; // Compare dates
    };  


    const toggleCardExpansion = (index) => {
        setExpandedCardIndex(expandedCardIndex === index ? null : index);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div>
            <nav className="navbar">
                <span className="menu-button" onClick={toggleMenu}>
                    ☰ {/* Hamburger Icon */}
                </span>

                <div className={`nav-buttons ${isMenuOpen ? 'open' : ''}`}>
                    <button onClick={() => setFilter('all')}>Show All</button>
                    <button onClick={() => setFilter('completed')}>Journey Completed</button>
                    <button onClick={() => setFilter('cancellation')}>Cancellation</button>
                    <button onClick={() => setFilter('refund')}>Refund</button>
                </div>
            </nav>

            <div className="card-container">
                {filteredEmails.map((email, index) => (
                    <div 
                        className={`email-card ${expandedCardIndex === index ? 'expanded' : ''}`} 
                        key={index}
                        onClick={() => toggleCardExpansion(index)}
                    >
                        {/* Minimal details layout */}
                        <div className="card-header">
                            <span className="train-name"><strong>{email['Train Name'] || 'N/A'}</strong></span>
                            <span className="station-info">
                                <strong>
                                    {email['Source Station'] || 'N/A'} - {email['Destination Station'] || 'N/A'}
                                </strong>
                            </span>
                        </div>
                        
                        <div className="card-status">
                            <span style={{ color: getStatusColor(email.Status) }}>
                                <strong>{getJourneyStatus(email['Date of Journey'],email.Status)}</strong>
                            </span>
                        </div>

                        {/* Expanded details visible only when the card is expanded */}
                        {expandedCardIndex === index && (
                            <div className="expanded-details">
                                <p><strong>Date of Journey:</strong> {email['Date of Journey'] || 'N/A'}</p>
                                <p><strong>PNR No:</strong> {email['PNR No'] || 'N/A'}</p>
                                {hasRefund(email) && <p><strong>Refund Amount:</strong> {email['refundAmount'] || 'N/A'}</p>}
                                {hasCancellation(email) && <p><strong>Cancelled Date:</strong> {email['Cancelled Date'] || 'N/A'}</p>}
                                {email.BookingAmount && <p><strong>Booking Amount:</strong> {email.BookingAmount || 'N/A'}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;