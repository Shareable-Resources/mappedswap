import React from 'react';
import Ticket from 'src/components/Tickets/Ticket';
import styles from '../../styles/4-pages/TicketLayout.module.scss';
import MyTickets from 'src/components/Tickets/MyTickets';
import ChatInfo from 'src/components/Tickets/ChatInfo';

function TicketLayout(props: any) {
  // const check = (id: any) => {
  //   return props.queues.filter((item: any) => item.id === id).length;
  // };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.ticket}>
          <div className={styles.myTickets}>
            <MyTickets />
          </div>
          <div className={styles.chat}>
            <Ticket />
          </div>
          <div className={styles.chat_details}>
            <ChatInfo />
          </div>
        </div>
      </div>
    </>
  );
}

export default TicketLayout;
