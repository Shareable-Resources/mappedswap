import React from 'react';
import navButton from '../../../styles/2-layout/NavBar/NavBarTicketButton.module.scss';

export const NavBarTicketButton = () => {
  return (
    <button className={navButton.button}>
      Accept Ticket <div className={navButton.ticketsAvailable}>{/*TODO: what happens if i have 15 or 100*/}1</div>
    </button>
  );
};
