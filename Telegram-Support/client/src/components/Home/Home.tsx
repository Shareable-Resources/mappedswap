import React from 'react';
import styles from '../../styles/3-components/Home/Home.module.scss';

const Home = () => {
  return (
    <div className={styles.home_container}>
      <div className={styles.home_welcome_msg}>
        <div>Welcome Back, Jaeyeon Park</div>
        <div>Notification Icon</div>
      </div>
      <div className={styles.home_welcome_msg2}>Let's get the day started.</div>
      <div className={styles.ticket_boxes_container}>
        <div className={styles.ticket_boxes}>
          Open Tickets
          <div className={styles.numbers}>3</div>
        </div>
        <div className={styles.ticket_boxes}>
          Pending Replies
          <div className={styles.numbers}>3</div>
        </div>
        <div className={styles.ticket_boxes}>
          Total Open Tickets
          <div className={styles.numbers}>12</div>
        </div>
        <div className={styles.ticket_boxes}>
          Customer Satisfaction
          <div className={styles.numbers}>88%</div>
        </div>
      </div>
      <div className={styles.ticket_title}>
        <div>All Tickets</div>
        <div>Icon Pictures</div>
        <div>Status Dropdown</div>
        <div>Issue Type Dropdown</div>
      </div>
      <div className={styles.tickets_container}>
        <div className={styles.ticket_table}>
          <div className={styles.ticket_header_group}>
            <div className={styles.ticket_headers}>Ticket Number</div>
            <div className={styles.ticket_headers}>Status</div>
            <div className={styles.ticket_headers}>Assignee</div>
            <div className={styles.ticket_headers}>Last Updated</div>
            <div className={styles.ticket_headers}>Username</div>
            <div className={styles.ticket_headers}>Issue Type</div>
          </div>
          <div className={styles.ticket_data_body}>
            <div className={styles.ticket_data_row}>
              <div className={styles.ticket_data_cell}>123456789</div>
              <div className={styles.ticket_data_cell}>Open</div>
              <div className={styles.ticket_data_cell}>Jaeyon Park</div>
              <div className={styles.ticket_data_cell}>2/24/2022 @ 11:54:00</div>
              <div className={styles.ticket_data_cell}>mike.ng</div>
              <div className={styles.ticket_data_cell}>Referral</div>
            </div>
          </div>
          <div className={styles.ticket_data_body}>
            <div className={styles.ticket_data_row}>
              <div className={styles.ticket_data_cell}>123456789</div>
              <div className={styles.ticket_data_cell}>Open</div>
              <div className={styles.ticket_data_cell}>Jaeyon Park</div>
              <div className={styles.ticket_data_cell}>2/24/2022 @ 11:54:00</div>
              <div className={styles.ticket_data_cell}>mike.ng</div>
              <div className={styles.ticket_data_cell}>Referral</div>
            </div>
          </div>
          <div className={styles.ticket_data_body}>
            <div className={styles.ticket_data_row}>
              <div className={styles.ticket_data_cell}>123456789</div>
              <div className={styles.ticket_data_cell}>Open</div>
              <div className={styles.ticket_data_cell}>Jaeyon Park</div>
              <div className={styles.ticket_data_cell}>2/24/2022 @ 11:54:00</div>
              <div className={styles.ticket_data_cell}>mike.ng</div>
              <div className={styles.ticket_data_cell}>Referral</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
