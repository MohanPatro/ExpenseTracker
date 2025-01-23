// import React from "react";
import React, { useState } from 'react';

import './displayEmailComponent.css';


// A component to display emails with expandable cards
const EmailList = ({ emails }) => {
    const [expandedEmailIndex, setExpandedEmailIndex] = useState(null);

    const handleCardClick = (index) => {
        setExpandedEmailIndex(expandedEmailIndex === index ? null : index);  // Toggle expansion
    };

    return (
        <div className="email-list-container">
            <h3>Your Emails:</h3>
            {emails.length > 0 ? (
                <div className="email-cards-container">
                    {emails.map((email, index) => (
                        <div
                            key={index}
                            className={`email-card ${expandedEmailIndex === index ? 'expanded' : ''}`}
                            onClick={() => handleCardClick(index)}
                        >
                            <h4>{email.from}</h4>
                            <p className="subject">{email.subject}</p>
                            {expandedEmailIndex === index && (
                                <>
                                    <p>{email.ticketInfo.Status}...</p>
                                    <a href="#" className="more-link">Read More</a>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No emails found.</p>
            )}        </div>
    );
};


export default EmailList;
